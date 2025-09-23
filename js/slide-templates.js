// スライドテンプレート管理
class SlideTemplates {
    constructor() {
        this.defaultHTML = this.getDefaultHTML();
        this.newSlideTemplate = this.getNewSlideTemplate();
    }

    getDefaultHTML() {
        return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>A4横向きスライド</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Hiragino Kaku Gothic Pro', 'Meiryo', sans-serif;
            background: #f0f0f0;
        }
        
        .slide {
            width: 297mm;  /* A4横向きの幅 */
            height: 210mm; /* A4横向きの高さ */
            min-height: 210mm; /* 最小高さを明示 */
            max-height: 210mm; /* 最大高さを明示 */
            background: white;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            margin: 20px auto;
            padding: 40px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: center;
            position: relative;
            page-break-after: always;  /* 各スライドの後で改ページ */
            page-break-inside: avoid; /* スライド内での改ページを防ぐ */
            break-after: always; /* 新しいCSS仕様 */
            break-inside: avoid; /* 新しいCSS仕様 */
            overflow: hidden; /* はみ出しを防ぐ */
        }
        
        /* 分割レイアウトの場合は縦方向レイアウトを維持 */
        .slide.slide-split {
            flex-direction: column !important;
            justify-content: flex-start !important;
        }
        
        /* 分割コンテンツエリアのみ横並びにする */
        .slide-split-content {
            display: flex !important;
            flex-direction: row !important;
            align-items: stretch !important;
            gap: 40px !important;
            flex: 1 !important;
        }
        
        .slide:last-child {
            page-break-after: auto;  /* 最後のスライドは改ページしない */
            break-after: auto; /* 新しいCSS仕様 */
        }
        
        .slide h1 {
            font-size: 48px;
            color: #2c3e50;
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 4px solid #3498db;
            padding-bottom: 20px;
        }
        
        .slide h2 {
            font-size: 36px;
            color: #34495e;
            margin-bottom: 25px;
            padding-left: 20px;
            border-left: 6px solid #e74c3c;
        }
        
        .slide p {
            font-size: 24px;
            line-height: 1.8;
            color: #2c3e50;
            margin-bottom: 20px;
            padding-left: 20px;
        }
        
        .slide ul {
            font-size: 22px;
            line-height: 1.8;
            color: #2c3e50;
            padding-left: 40px;
        }
        
        .slide li {
            margin-bottom: 15px;
            position: relative;
        }
        
        .slide li:before {
            content: "▶";
            color: #3498db;
            font-weight: bold;
            position: absolute;
            left: -25px;
        }
        
        .highlight {
            background: linear-gradient(transparent 60%, #fff59d 60%);
            padding: 2px 4px;
        }
        
        .center {
            text-align: center;
        }
        
        .footer {
            position: absolute;
            bottom: 20px;
            right: 30px;
            font-size: 18px;
            color: #7f8c8d;
        }
        
        /* 印刷・PDF出力時の設定 */
        @media print {
            body { 
                background: white !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            .slide {
                box-shadow: none !important;
                margin: 0 !important;
                width: 297mm !important;
                height: 210mm !important;
                min-height: 210mm !important;
                max-height: 210mm !important;
                page-break-after: always !important;
                page-break-inside: avoid !important;
                break-after: always !important;
                break-inside: avoid !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: center !important;
                position: relative !important;
                overflow: visible !important;
            }
            
            .slide.slide-split {
                flex-direction: column !important;
                justify-content: flex-start !important;
            }
            
            .slide-split-content {
                display: flex !important;
                flex-direction: row !important;
                align-items: stretch !important;
                gap: 40px !important;
                flex: 1 !important;
            }
            .slide:last-child {
                page-break-after: auto !important;
                break-after: auto !important;
            }
        }
        
        @page {
            size: A4 landscape;
            margin: 0;
        }
        
        /* 左右2分割レイアウト用CSS */
        .slide-content {
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            min-width: 0 !important; /* フレックスアイテムの縮小を許可 */
        }
        
        .slide-image {
            flex: 1 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            min-width: 0 !important; /* フレックスアイテムの縮小を許可 */
        }
        
        .slide-image img {
            max-width: 100% !important;
            max-height: 100% !important;
            width: auto !important;
            height: auto !important;
            object-fit: contain !important;
            border-radius: 8px !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
        }
        
        /* 分割レイアウトでのテキスト調整 */
        .slide-split h1 {
            font-size: 36px !important;
            margin-bottom: 20px !important;
        }
        
        .slide-split h2 {
            font-size: 28px !important;
            margin-bottom: 15px !important;
        }
        
        .slide-split p {
            font-size: 20px !important;
            line-height: 1.6 !important;
        }
        
        .slide-split ul {
            font-size: 18px !important;
        }
        
        .slide-split li {
            margin-bottom: 12px !important;
        }
    </style>
</head>
<body>
    <!-- スライド1 -->
    <div class="slide">
        <h1>プレゼンテーションタイトル</h1>
        
        <h2>概要</h2>
        
        <ul>
            <li><span class="highlight">目的</span> - このプレゼンテーションの目的</li>
            <li><span class="highlight">対象</span> - 想定している聴衆</li>
            <li><span class="highlight">構成</span> - 発表の流れと内容</li>
        </ul>
        
        <p class="center" style="margin-top: 40px; font-size: 28px; color: #3498db;">
            <strong>始めましょう</strong>
        </p>
        
        <div class="footer">
            2025年9月 - スライド 1/3
        </div>
    </div>

    <!-- スライド2 -->
    <div class="slide">
        <h1>主要なポイント</h1>
        
        <h2>重要な項目</h2>
        
        <ul>
            <li><span class="highlight">項目1</span> - 最初の重要な点について詳しく説明</li>
            <li><span class="highlight">項目2</span> - 二番目のポイントとその意義</li>
            <li><span class="highlight">項目3</span> - 三番目の要素と影響について</li>
        </ul>
        
        <p style="margin-top: 40px; font-size: 26px; padding-left: 20px;">
            これらの項目は相互に関連し合い、全体として重要な意味を持ちます。
        </p>
        
        <div class="footer">
            2025年9月 - スライド 2/3
        </div>
    </div>

    <!-- スライド3 -->
    <div class="slide">
        <h1>まとめ</h1>
        
        <h2>結論</h2>
        
        <ul>
            <li><span class="highlight">成果</span> - 達成できた結果と効果</li>
            <li><span class="highlight">学習</span> - プロセスで得られた知見</li>
            <li><span class="highlight">次のステップ</span> - 今後の展開と計画</li>
        </ul>
        
        <p class="center" style="margin-top: 40px; font-size: 32px; color: #27ae60;">
            <strong>ご清聴ありがとうございました</strong>
        </p>
        
        <div class="footer">
            2025年9月 - スライド 3/3
        </div>
    </div>
</body>
</html>`;
    }

    getNewSlideTemplate() {
        return `
    <!-- 新しいスライド -->
    <div class="slide">
        <h1>新しいスライド</h1>
        
        <h2>サブタイトル</h2>
        
        <ul>
            <li><span class="highlight">ポイント1</span> - 最初のポイントについて説明</li>
            <li><span class="highlight">ポイント2</span> - 二番目のポイントについて説明</li>
            <li><span class="highlight">ポイント3</span> - 三番目のポイントについて説明</li>
        </ul>
        
        <p style="margin-top: 40px; font-size: 24px; padding-left: 20px;">
            ここに追加の説明や詳細情報を記入してください。<br>
            <small style="color: #7f8c8d;">💡 このスライドで画像を挿入すると、自動的に左右2分割レイアウトになります</small>
        </p>
        
        <div class="footer">
            PAGE_NUMBER_PLACEHOLDER
        </div>
    </div>`;
    }

    // ページ番号を振り直す関数
    updatePageNumbers(htmlContent) {
        // スライド要素を検索してページ番号を更新
        const slideStartRegex = /<div class="slide">/g;
        const footerRegex = /<div class="footer">\s*([^<]*?)\s*<\/div>/g;
        
        let slideCount = 0;
        let match;
        
        // スライド数をカウント
        while ((match = slideStartRegex.exec(htmlContent)) !== null) {
            slideCount++;
        }
        
        // 各フッターのページ番号を更新
        let updatedContent = htmlContent;
        let currentSlide = 1;
        
        // フッターを順番に更新
        updatedContent = updatedContent.replace(footerRegex, (match, content) => {
            const pageNumber = `${currentSlide}/${slideCount}`;
            const currentDate = new Date().getFullYear() + '年' + (new Date().getMonth() + 1) + '月';
            
            // プレースホルダーがある場合は置換
            if (content.includes('PAGE_NUMBER_PLACEHOLDER')) {
                const newFooter = `${currentDate} - スライド ${pageNumber}`;
                currentSlide++;
                return `<div class="footer">
            ${newFooter}
        </div>`;
            } else {
                // 既存のフッターのページ番号部分のみを更新
                // 日付部分を保持し、ページ番号のみを更新
                let updatedFooter = content.trim();
                
                // 既存のページ番号パターンを検索して置換
                const pageNumberPattern = /\d+\/\d+/;
                if (pageNumberPattern.test(updatedFooter)) {
                    updatedFooter = updatedFooter.replace(pageNumberPattern, pageNumber);
                } else {
                    // ページ番号がない場合は追加
                    updatedFooter = updatedFooter.replace(/(\d{4}年\d+月)/, `$1 - スライド ${pageNumber}`);
                }
                
                currentSlide++;
                return `<div class="footer">
            ${updatedFooter}
        </div>`;
            }
        });
        
        return updatedContent;
    }

    // スライド挿入位置を検索する関数
    findSlideInsertPosition(htmlContent, cursorPosition) {
        // カーソル位置から前方に検索して、現在のスライドの開始位置を見つける
        const slideStartRegex = /<div class="slide">/g;
        const slideEndRegex = /<\/div>/g;
        
        let currentSlideStart = -1;
        let currentSlideEnd = -1;
        let match;
        
        // 全てのスライドの位置を取得
        const slidePositions = [];
        while ((match = slideStartRegex.exec(htmlContent)) !== null) {
            slidePositions.push({
                start: match.index,
                end: -1 // 後で設定
            });
        }
        
        // 各スライドの終了位置を特定
        slidePositions.forEach((slide, index) => {
            slideEndRegex.lastIndex = 0; // リセット
            let depth = 1; // 開始タグをカウント
            let searchPos = slide.start + '<div class="slide">'.length;
            
            while (depth > 0 && searchPos < htmlContent.length) {
                const nextDivStart = htmlContent.indexOf('<div', searchPos);
                const nextDivEnd = htmlContent.indexOf('</div>', searchPos);
                
                if (nextDivEnd === -1) break;
                
                if (nextDivStart !== -1 && nextDivStart < nextDivEnd) {
                    // divの開始タグが見つかった
                    depth++;
                    searchPos = nextDivStart + 4;
                } else {
                    // divの終了タグが見つかった
                    depth--;
                    if (depth === 0) {
                        slide.end = nextDivEnd + 6; // </div>の長さ
                        break;
                    }
                    searchPos = nextDivEnd + 6;
                }
            }
        });
        
        // カーソル位置がどのスライド内にあるか判定
        for (let i = 0; i < slidePositions.length; i++) {
            const slide = slidePositions[i];
            if (slide.end !== -1 && cursorPosition >= slide.start && cursorPosition <= slide.end) {
                // カーソルがこのスライド内にある場合、このスライドの後に挿入
                return slide.end;
            }
        }
        
        // カーソルがスライド内にない場合、最後のスライドの後に追加
        if (slidePositions.length > 0) {
            const lastSlide = slidePositions[slidePositions.length - 1];
            if (lastSlide.end !== -1) {
                return lastSlide.end;
            }
        }
        
        // フォールバック: HTMLの最後に追加
        return htmlContent.length;
    }
}
