const express = require('express');
const multer  = require('multer');
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');

const upload = multer({ dest: 'uploads/' });
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // to support URL-encoded bodies

// 静的ファイルを提供する
app.use(express.static('public'));  // 'public' フォルダ内の静的ファイルを提供します。

app.post('/synthesize', upload.single('textFile'), async (req, res) => {
    const text = fs.readFileSync(req.file.path, 'utf8'); // ユーザーがアップロードしたテキストファイルを読み込み

    const client = new textToSpeech.TextToSpeechClient();
    
    const request = {
        input: {text: text},
        voice: { languageCode: req.body.language, name: req.body.voice },
        audioConfig: { audioEncoding: 'MP3', speakingRate: req.body.speakingRate, pitch: req.body.pitch },
    };
  
    const [response] = await client.synthesizeSpeech(request);
    const writeFile = util.promisify(fs.writeFile);
    await writeFile('output.mp3', response.audioContent, 'binary');
    
    res.download('output.mp3'); // ダウンロードリンクを提供
});

app.listen(3000, () => console.log('Server is running on port 3000.'));
