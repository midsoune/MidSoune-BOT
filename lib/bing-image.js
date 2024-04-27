import { fetch } from 'undici';
import { FormData, Blob } from 'formdata-node';
import { fileTypeFromBuffer } from 'file-type';
import cheerio from 'cheerio';
import Jimp from 'jimp';
import { fetch as fetchUndici } from 'undici';
import fakeUserAgent from 'fake-useragent';

const BING_URL = "https://www.bing.com";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateRandomIP = () => {
    const octet = () => Math.floor(Math.random() * 256);
    return `${octet()}.${octet()}.${octet()}.${octet()}`;
};

const generateRandomUserAgent = () => {
    const androidVersions = ['4.0.3', '4.1.1', '4.2.2', '4.3', '4.4', '5.0.2', '5.1', '6.0', '7.0', '8.0', '9.0', '10.0', '11.0'];
    const deviceModels = ['M2004J19C', 'S2020X3', 'Xiaomi4S', 'RedmiNote9', 'SamsungS21', 'GooglePixel5'];
    const buildVersions = ['RP1A.200720.011', 'RP1A.210505.003', 'RP1A.210812.016', 'QKQ1.200114.002', 'RQ2A.210505.003'];
    const selectedModel = deviceModels[Math.floor(Math.random() * deviceModels.length)];
    const selectedBuild = buildVersions[Math.floor(Math.random() * buildVersions.length)];
    const chromeVersion = `Chrome/${Math.floor(Math.random() * 80) + 1}.${Math.floor(Math.random() * 999) + 1}.${Math.floor(Math.random() * 9999) + 1}`;
    const userAgent = `Mozilla/5.0 (Linux; Android ${androidVersions[Math.floor(Math.random() * androidVersions.length)]}; ${selectedModel} Build/${selectedBuild}) AppleWebKit/537.36 (KHTML, like Gecko) ${chromeVersion} Mobile Safari/537.36 WhatsApp/1.${Math.floor(Math.random() * 9) + 1}.${Math.floor(Math.random() * 9) + 1}`;
    return userAgent;
};

const getValidIPv4 = (ip) => {
    const match = !ip || ip.match(/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\/([0-9]|[1-2][0-9]|3[0-2]))?$/);
    if (match) {
        if (match[5]) {
            const mask = parseInt(match[5], 10);
            let [a, b, c, d] = ip.split('.').map(x => parseInt(x, 10));
            const max = (1 << (32 - mask)) - 1;
            const rand = Math.floor(Math.random() * max);
            d += rand;
            c += Math.floor(d / 256);
            d %= 256;
            b += Math.floor(c / 256);
            c %= 256;
            a += Math.floor(b / 256);
            b %= 256;
            return `${a}.${b}.${c}.${d}`;
        }
        return ip;
    }
    return undefined;
};

export class BingImageCreator {
    static HEADERS = {
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "max-age=0",
        "content-type": "application/x-www-form-urlencoded",
        referrer: "https://www.bing.com/images/create/",
        origin: "https://www.bing.com",
        "user-agent": fakeUserAgent() || generateRandomUserAgent(),
        "x-forwarded-for": getValidIPv4(generateRandomIP()) || generateRandomIP()
    };

    constructor({ cookie }) {
        this._cookie = `_U=${cookie}`;

        if (!this._cookie) {
            throw new Error("Bing cookie is required");
        }
    }

    async fetchRedirectUrl(url, formData) {
        const response = await fetchUndici(url, {
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: {
                cookie: this._cookie,
                ...BingImageCreator.HEADERS,
            },
            body: formData,
            redirect: "manual",
        });

        if (response.ok) {
            throw new Error("Request failed");
        } else {
            const redirect_url = response.headers.get("location").replace("&nfy=1", "");
            const request_id = redirect_url.split("id=")[1];
            return {
                redirect_url,
                request_id,
            };
        }
    }

    async fetchResult(encodedPrompt, redirect_url, request_id) {
        console.log("redirect_url is ", redirect_url);
        console.log("request_id is ", request_id);
        const cookie = this._cookie;
        try {
            await fetchUndici(`${BING_URL}${redirect_url}`, {
                method: "GET",
                mode: "cors",
                credentials: "include",
                headers: {
                    cookie,
                    ...BingImageCreator.HEADERS,
                },
            });
        } catch (e) {
            throw new Error(`Request redirect_url failed" ${e.message}`);
        }

        const getResultUrl = `${BING_URL}/images/create/async/results/${request_id}?q=${encodedPrompt}`;
        const start_wait = Date.now();
        let result = "";
        while (true) {
            console.log("Waiting for result...");
            if (Date.now() - start_wait > 200000) {
                throw new Error("Timeout");
            }

            await sleep(1000);
            result = await this.getResults(getResultUrl);
            if (result) {
                break;
            }
        }
        return this.parseResult(result);
    }

    async getResults(getResultUrl) {
        const response = await fetchUndici(getResultUrl, {
            method: "GET",
            mode: "cors",
            credentials: "include",
            headers: {
                cookie: this._cookie,
                ...BingImageCreator.HEADERS,
            },
        });
        if (response.status !== 200) {
            throw new Error("Bad status code");
        }
        const content = await response.text();
        if (!content || content.includes("errorMessage")) {
            return null;
        } else {
            return content;
        }
    }

    parseResult(result) {
        console.log("Parsing result...");
        const regex = /src="([^"]*)"/g;
        const matches = [...result.matchAll(regex)].map((match) => match[1]);
        const normal_image_links = matches.map((link) => link.split("?w=")[0]);
        const safe_image_links = normal_image_links.filter((link) => !/r.bing.com\/rp/i.test(link));
        safe_image_links.length !== normal_image_links.length && console.log("Detected & Removed bad images");
        const unique_image_links = [...new Set(safe_image_links)];
        if (unique_image_links.length === 0) {
            throw new Error("error_no_images");
        }
        return unique_image_links;
    }

    async fetchRedirectUrlWithRetry(url, formData, retries = 30) {
        for (let i = 0; i < retries; i++) {
            try {
                return await this.fetchRedirectUrl(url, formData);
            } catch (error) {
                console.log(`retry ${i + 1} time`);
                if (i === retries - 1) {
                    throw new Error(`Max retries reached: ${error.message}`);
                }
            }
        }
    }

    async fetchResultWithRetry(encodedPrompt, redirect_url, request_id, retries = 30) {
        for (let i = 0; i < retries; i++) {
            try {
                return await this.fetchResult(encodedPrompt, redirect_url, request_id);
            } catch (error) {
                console.log(`retry ${i + 1} time`);
                if (i === retries - 1) {
                    throw new Error(`Max retries reached: ${error.message}`);
                }
            }
        }
    }

    async getResultsWithRetry(getResultUrl, retries = 30) {
        for (let i = 0; i < retries; i++) {
            try {
                return await this.getResults(getResultUrl);
            } catch (error) {
                console.log(`retry ${i + 1} time`);
                if (i === retries - 1) {
                    throw new Error(`Max retries reached: ${error.message}`);
                }
            }
        }
    }

    async createImage(prompt) {
        const encodedPrompt = encodeURIComponent(prompt);
        let formData = new FormData();
        formData.append("q", encodedPrompt);
        formData.append("qa", "ds");
        console.log("Sending request...");
        const url = `${BING_URL}/images/create?q=${encodedPrompt}&rt=3&FORM=GENCRE`;

        try {
            const { redirect_url, request_id } = await this.fetchRedirectUrlWithRetry(url, formData);
            return this.fetchResultWithRetry(encodedPrompt, redirect_url, request_id);
        } catch (e) {
            console.log("retry 1 time");
            return this.fetchRedirectUrlWithRetry(url, formData)
                .then((res) => this.fetchResultWithRetry(encodedPrompt, res.redirect_url, res.request_id))
                .catch((e) => {
                    throw new Error(`${e.message}`);
                });
        }
    }
}
class ImageProcessor {
    constructor() {
        this.urlRegex = /^(https?):\/\/[^\s/$.?#].[^\s]*$/i;
    }

    async processImage(input, endpoint, options) {
        try {
            const inputBuffer =
                Buffer.isBuffer(input) || (input instanceof ArrayBuffer || ArrayBuffer.isView(input)) ?
                input :
                this.urlRegex.test(input) ?
                await fetch(input).then((response) => response.arrayBuffer()) :
                Buffer.alloc(0);
            const image = await Jimp.read(inputBuffer);
            const photoBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);

            const {
                ext,
                mime
            } = await fileTypeFromBuffer(photoBuffer) || {};
            const photoBlob = new Blob([photoBuffer], {
                type: mime
            });

            const formData = new FormData();
            Object.entries(options).forEach(([key, value]) => {
                formData.append(key, value);
            });
            formData.append('uploadfile', photoBlob, `photo.${ext}`);

            const uploadResponse = await fetch(endpoint, {
                method: 'POST',
                body: formData,
            });

            const responseData = await uploadResponse.text();
            console.info(responseData)
            const $ = cheerio.load(responseData);
            const links = $('#content a').map((index, element) => {
                let link = $(element).attr('href');
                return link && !link.startsWith('https') ? 'https://www.imgonline.com.ua/' + link : link;
            }).get();
            const resultText = $('div[style="background-color:#CCFFCC;padding:5px;"]').text().trim();
            return {
                url: links || '',
                text: resultText || ''
            };
        } catch (e) {
            console.log('Error', e);
        }
    }

    async compressImage(input) {
        const endpoint = 'https://www.imgonline.com.ua/compress-image-result.php';
        const options = {
            efset1: '1',
            efset2: '1',
            jpegtype: '1',
            jpegmeta: '1',
            jpegqual: '1',
        };
        return await this.processImage(input, endpoint, options);
    }

    async resizeImage(input, width, height) {
        const endpoint = 'https://www.imgonline.com.ua/resize-image-result.php';
        const options = {
            imgwidth: width,
            imgheight: height,
            imgresizetype: '1',
            pset: '3',
            filtset: '5',
            dpiset: '0',
            outformat: '2',
            jpegtype: '1',
            jpegqual: '92',
            jpegmeta: '1',
        };
        return await this.processImage(input, endpoint, options);
    }

    async convertImage(input, type) {
        const endpoint = 'https://www.imgonline.com.ua/convert-result.php';
        const options = {
            'ef-set': type,
            'ef-set-2': '1',
            'ef-set-3': 'bce',
            'jpeg-conv-type': '1',
            'jpeg-meta': '1',
            'jpeg-quality': '92',
            'outformat': '2',
            'jpegtype': '1',
            'jpegqual': '92',
            'jpegmeta': '1',
        };
        return await this.processImage(input, endpoint, options);
    }

    async textOnImage(input, text) {
        const endpoint = 'https://www.imgonline.com.ua/text-on-image-result.php';
        const options = {
            addtext: text,
            readysettings: '1',
            textblocklocation: '1',
            textblockpositioning: '6',
            textblockxoffset: '0',
            textblockyoffset: '0',
            textblockoffsetunit: '2',
            textblockw: '100',
            textblockh: '12',
            textblocksizeunit: '2',
            textblockbackgrcolor: '1',
            textblockbackgrhex: '#000000',
            textblockbackgrtransp: '60',
            textblockrotate: '1',
            textrotate: '0',
            textfont: '4',
            textsize: '50',
            textcolor: '7',
            textcolorhex: '#ffffff',
            textcolortransp: '0',
            textblocktextpositioning: '5',
            textsmooth: '4',
            textedge: '5',
            textedgeunit: '2',
            textedgecolor: '5',
            textedgecolorhex: '#ff00ff',
            textedgetransp: '5',
            textbackgrcolor: '11',
            textbackgrhex: '#00ff00',
            textbackgrtransp: '5',
            distletters: '5',
            distwords: '5',
            distlines: '5',
            shadowcolor: '10',
            shadowcolorhex: '#f0f0f0',
            shadowtransp: '80',
            shadowoffsetx: '2',
            shadowoffsety: '2',
            shadowblur: '10',
            outformat: '3',
            jpegtype: '1',
            jpegqual: '92',
            jpegmeta: '2',
        };
        return await this.processImage(input, endpoint, options);
    }

    async replaceBackground(input, color) {
        const endpoint = 'https://www.imgonline.com.ua/replace-white-background-with-transparent-result.php';
        const options = {
            efset: '20',
            efset2: '5',
            setcol: '14',
            setcolhex: color,
            efset5: '-50',
            efset6: '1',
            jpegtype: '1',
            jpegqual: '92',
            outformat: '3',
            jpegmeta: '2',
        };
        return await this.processImage(input, endpoint, options);
    }

    async ocrImage(input) {
        const endpoint = 'https://www.imgonline.com.ua/ocr-result.php';
        const options = {
            efset1: '19',
            efset2: '1',
            efset3: '2',
            efset4: '3',
            efset5: '4',
            efset6: '1',
            efset7: '1',
            efset8: '1',
        };
        return await this.processImage(input, endpoint, options);
    }

    async retouchPhoto(input) {
        const endpoint = 'https://www.imgonline.com.ua/retouch-photo-result.php';
        const options = {
            efset1: '4',
            efset2: '3',
            sharpint: '12',
            briset: '0',
            contrset: '0',
            saturset: '0',
            mpxlimit: '2',
            outformat: '2',
            jpegtype: '1',
            jpegqual: '92',
        };
        return await this.processImage(input, endpoint, options);
    }

    async fairyTaleEffect(input) {
        const endpoint = 'https://www.imgonline.com.ua/fairy-tale-picture-effect-result.php';
        const options = {
            efset1: '2',
            efset2: '1',
            efset3: '1',
            sharpint: '12',
            briset: '0',
            contrset: '0',
            saturset: '0',
            toneset: '1',
            efset4: '1',
            efset5: '1',
            mpxlimit: '2',
            outformat: '2',
            jpegtype: '1',
            jpegqual: '92',
        };
        return await this.processImage(input, endpoint, options);
    }

    async whirlpoolEffect(input) {
        const endpoint = 'https://www.imgonline.com.ua/whirlpool-effect-result.php';
        const options = {
            'ef-set': '10',
            'ef-set-2': '50',
            'ef-set-3': '50',
            'ef-set-4': '1',
            'jpeg-quality': '92',
        };
        return await this.processImage(input, endpoint, options);
    }

    async enlargeImage(input) {
        const endpoint = 'https://www.imgonline.com.ua/enlarge-image-result.php';
        const options = {
            efset1: '1',
            efset2: '1',
            outformat: '2',
            jpegtype: '1',
            jpegqual: '92',
        };
        return await this.processImage(input, endpoint, options);
    }

    async createQr(input) {
        const endpoint = 'https://www.imgonline.com.ua/create-qr-code-result.php';
        const options = {
            'effect-settings': '',
            qtype: input,
            'effect-settings-2': '5',
            'effect-settings-3': '1',
            'effect-settings-4': '0',
            'effect-settings-5': '2',
            'effect-settings-6': '2',
            'effect-settings-7': '#000000',
            'effect-settings-8': '#ff0000',
            'jpeg-conv-type': '3',
            'jpeg-quality': '95',
        };
        return await this.processImage(input, endpoint, options);
    }

    async scanQr(input) {
        const endpoint = 'https://www.imgonline.com.ua/scan-qr-bar-code-result.php';
        const options = {
            codetype: '1',
            rotset: '0',
            croptype: '1',
            cropleft: '0',
            cropright: '0',
            croptop: '0',
            cropbottom: '0',
        };
        return await this.processImage(input, endpoint, options);
    }

    async autoColorImage(input) {
        const endpoint = 'https://www.imgonline.com.ua/auto-color-balance-photo-result.php';
        const options = {
            'ef-set': '0',
            'jpeg-conv-type': '1',
            'jpeg-quality': '92'
        };
        return await this.processImage(input, endpoint, options);
    }

    async autoColorContrast(input) {
        const endpoint = 'https://www.imgonline.com.ua/auto-contrast-result.php';
        const options = {
            outformat: '2',
            jpegtype: '1',
            jpegqual: '92',
            jpegmeta: '1'
        };
        return await this.processImage(input, endpoint, options);
    }

    async tiltImage(input) {
        const endpoint = 'https://www.imgonline.com.ua/tilt-shift-get-settings-result.php';
        const options = {
            'jpeg-quality': '92'
        };
        return await this.processImage(input, endpoint, options);
    }

    async frameImage(input, frame) {
        const endpoint = 'https://www.imgonline.com.ua/add-frame-result.php';
        const options = {
            'effect-settings': frame,
            'jpeg-conv-type': '1',
            'jpeg-quality': '92'
        };
        return await this.processImage(input, endpoint, options);
    }

    async frameBlurImage(input, color) {
        const endpoint = 'https://www.imgonline.com.ua/frame-blurred-result.php';
        const options = {
            efset: '32',
            efset2: '32',
            efset3: '32',
            efset4: '1',
            efset5: '0',
            efset6: color,
            efset7: '1',
            outformat: '2',
            jpegtype: '1',
            jpegqual: '91',
        };
        return await this.processImage(input, endpoint, options);
    }

    async distortionImage(input, int) {
        const endpoint = 'https://www.imgonline.com.ua/picture-distortion-result.php';
        const options = {
            'ef-set': int,
            'jpeg-quality': '92'
        };
        return await this.processImage(input, endpoint, options);
    }
}
export {ImageProcessor};
