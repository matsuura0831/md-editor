# md-editor

導入完了．

* docker
* tailwind
* ace-editor
    * frontend/src/js/ace-util.js
        * ビューワーとの同期用(ライブアップデート)とdrawio実行機能を実装
* markdown-it
    * markdown-it-abbr
    * markdown-it-container
    * markdown-it-emoji
    * markdown-it-footnote
    * markdown-it-ins
    * markdown-it-mark
    * markdown-it-plantuml
    * markdown-it-sub
    * markdown-it-sup
    * 独自
        * markdown-it-highlight
            * ハイライト+行数を表示するpluginを追加
        * markdown-it-inject-line-no
            * pタグにdata-line要素を追加．AceEditorスクロール時に同期を取るために利用
        * markdown-it-message
            * markdown-it-containerを利用してerror,warn,success,infoのカードを作成
        * markdown-it-drawio
            * drawioから得られたデータを表示
            * drawioへの送信&編集は frontend/src/js/ace-util.js で実装

未導入

* electron利用
    * notebookやtagの実装
* AWS-S3との同期
* スニペット作成
* 各種設定変更
    * plantumlサーバ変更
    * ace-editorの設定変更
* CSSテーマ切り替え
