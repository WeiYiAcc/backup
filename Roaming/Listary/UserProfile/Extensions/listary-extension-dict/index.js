const axios = require("axios");

async function search(query) {
    const response = await axios({
        url: 'http://www.iciba.com/index.php',
        params: {
            a: 'getWordMean',
            c: 'search',
            list: '1',
            word: query
        }
    });
    const json = response.data;
    // console.log(json);

    if (json.errno != 0) {
        return [{
            title: json.errmsg
        }];
    }

    if (json.baesInfo.symbols) {
        return json.baesInfo.symbols[0].parts.map(part => {
            var meaning = part.part + " ";
            meaning += part.means.join("；");

            var result = {
                title: meaning
            }
            return result;
        });
    }
    else if (json.baesInfo.translate_result) {
        return [{
            title: json.baesInfo.translate_result
        }];
    }
    else {
        return [{
            title: "没有找到相关结果"
        }];
    }
}
module.exports = {
    search: search
};