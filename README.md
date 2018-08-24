### Collective Times

`Collective Times` へRSSサイトデータを追加するためのChromeExtension

[参考](https://support.google.com/chrome/a/answer/2714278?hl=ja)

### 前提

下記の内容で``js/accessToken.js`` を作成する

```
const ACCESS_TOKEN = 'your_token';
```

tokenの取得に関しては通常のOuth2で実施すること

### 使い方

Chromeを開き、下記を実施

1. `chrome://extensions/` をアドレスバーに入力
2. ディベロッパーモードを有効
3. パッケージ化されていない拡張機能を読み込む
4. 本ディレクトリを指定
