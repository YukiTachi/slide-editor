// メイン機能
let isResizing = false;
let startX = 0;
let startWidth = 0;
let previewWindow = null;
let autoSave = null;
let imageInserter = null;
let slideTemplates = null;

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    // スライドテンプレートを初期化
    slideTemplates = new SlideTemplates();
    window.defaultHTML = slideTemplates.defaultHTML;
    
    // デフォルトHTMLを設定
    document.getElementById('htmlEditor').value = slideTemplates.defaultHTML;
    updatePreview();
    document.getElementById('htmlEditor').focus();
    
    // 自動保存機能を初期化
    autoSave = new AutoSave('htmlEditor', 'autoSaveStatus');
    window.autoSave = autoSave;
    
    // 画像挿入機能を初期化
    imageInserter = new ImageInserter('htmlEditor');
    window.imageInserter = imageInserter;
});

// プレビュー更新
function updatePreview() {
    const editor = document.getElementById('htmlEditor');
    const previewFrame = document.getElementById('previewFrame');
    const placeholder = document.getElementById('placeholder');
    
    const htmlContent = editor.value.trim();
    
    if (htmlContent) {
        placeholder.style.display = 'none';
        
        // ローカルストレージの画像をdata URIに変換
        const processedHTML = imageInserter ? 
            imageInserter.processHTMLForPreview(htmlContent) : 
            htmlContent;
        
        const doc = previewFrame.contentDocument || previewFrame.contentWindow.document;
        doc.open();
        doc.write(processedHTML);
        doc.close();
        
        const charCount = htmlContent.length;
        const lineCount = htmlContent.split('\n').length;
        document.getElementById('statusText').textContent = `${lineCount}行, ${charCount}文字 - スライド更新済み`;
    } else {
        placeholder.style.display = 'block';
        document.getElementById('statusText').textContent = '準備完了 - スライドテンプレート読み込み済み';
    }
}

// 別ウィンドウでプレビューを開く
function openPreviewWindow() {
    const editor = document.getElementById('htmlEditor');
    const htmlContent = editor.value.trim();
    
    if (!htmlContent) {
        alert('プレビューするHTMLコンテンツがありません');
        return;
    }
    
    if (previewWindow && !previewWindow.closed) {
        previewWindow.close();
    }
    
    previewWindow = window.open('', 'preview', 'width=1200,height=800,scrollbars=yes,resizable=yes');
    
    if (!previewWindow) {
        alert('ポップアップがブロックされました。ブラウザの設定を確認してください。');
        return;
    }
    
    // ローカルストレージの画像をdata URIに変換
    const processedHTML = imageInserter ? 
        imageInserter.convertStorageImagesToDataURI(htmlContent) : 
        htmlContent;
    
    previewWindow.document.title = 'プレビュー - スライドエディタ';
    previewWindow.document.open();
    previewWindow.document.write(processedHTML);
    previewWindow.document.close();
    previewWindow.focus();
    
    const statusText = document.getElementById('statusText');
    const originalText = statusText.textContent;
    statusText.textContent = '別ウィンドウでプレビューを開きました';
    setTimeout(() => {
        statusText.textContent = originalText;
    }, 2000);
}

// エディタクリア
function clearEditor() {
    if (confirm('エディタの内容をクリアしますか？')) {
        document.getElementById('htmlEditor').value = '';
        updatePreview();
    }
}

// HTMLコピー
function copyToClipboard() {
    const editor = document.getElementById('htmlEditor');
    const htmlContent = editor.value;
    
    if (!htmlContent.trim()) {
        alert('コピーするHTMLがありません');
        return;
    }
    
    // ローカルストレージの画像をdata URIに変換してコピー
    const processedHTML = imageInserter ? 
        imageInserter.convertStorageImagesToDataURI(htmlContent) : 
        htmlContent;
    
    navigator.clipboard.writeText(processedHTML).then(() => {
        const statusText = document.getElementById('statusText');
        const originalText = statusText.textContent;
        statusText.textContent = 'HTMLをクリップボードにコピーしました！（画像も含む）';
        setTimeout(() => {
            statusText.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('コピーに失敗:', err);
        alert('クリップボードへのコピーに失敗しました');
    });
}

// パネルリサイズ機能
function startResize(e) {
    isResizing = true;
    startX = e.clientX;
    startWidth = document.querySelector('.editor-panel').offsetWidth;
    document.addEventListener('mousemove', doResize);
    document.addEventListener('mouseup', stopResize);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
}

function doResize(e) {
    if (!isResizing) return;
    
    const container = document.querySelector('.container');
    const containerWidth = container.offsetWidth;
    const deltaX = e.clientX - startX;
    const newWidth = startWidth + deltaX;
    const minWidth = 300;
    const maxWidth = containerWidth - 300;
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
        const percentage = (newWidth / containerWidth) * 100;
        document.querySelector('.editor-panel').style.width = percentage + '%';
        document.querySelector('.preview-panel').style.width = (100 - percentage) + '%';
    }
}

function stopResize() {
    isResizing = false;
    document.removeEventListener('mousemove', doResize);
    document.removeEventListener('mouseup', stopResize);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
}

// スライド追加機能
function addSlide() {
    const editor = document.getElementById('htmlEditor');
    const cursorPosition = editor.selectionStart;
    const htmlContent = editor.value;
    
    // カーソル位置から前後に検索して、現在のスライドの範囲を特定
    const slideInsertPosition = slideTemplates.findSlideInsertPosition(htmlContent, cursorPosition);
    
    // 新しいHTMLコンテンツを作成
    let newHtmlContent = htmlContent.slice(0, slideInsertPosition) + 
                       slideTemplates.newSlideTemplate + 
                       htmlContent.slice(slideInsertPosition);
    
    // ページ番号を振り直し
    newHtmlContent = slideTemplates.updatePageNumbers(newHtmlContent);
    
    // エディタに新しいコンテンツを設定
    editor.value = newHtmlContent;
    
    // プレビューを更新
    updatePreview();
    
    // カーソル位置を新しいスライドの開始位置に移動
    const newCursorPosition = slideInsertPosition + slideTemplates.newSlideTemplate.indexOf('<h1>新しいスライド</h1>');
    editor.setSelectionRange(newCursorPosition, newCursorPosition);
    editor.focus();
    
    // ステータス更新
    const statusText = document.getElementById('statusText');
    statusText.textContent = '新しいスライドを追加しました（ページ番号を更新）';
    setTimeout(() => {
        updateStatusText();
    }, 2000);
}

// ステータステキスト更新
function updateStatusText() {
    const editor = document.getElementById('htmlEditor');
    const statusText = document.getElementById('statusText');
    const htmlContent = editor.value.trim();
    
    if (htmlContent) {
        const charCount = htmlContent.length;
        const lineCount = htmlContent.split('\n').length;
        statusText.textContent = `${lineCount}行, ${charCount}文字 - スライド更新済み`;
    } else {
        statusText.textContent = '準備完了 - スライドテンプレート読み込み済み';
    }
}

// キーボードショートカット
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 's':
                e.preventDefault();
                copyToClipboard();
                break;
            case 'k':
                e.preventDefault();
                clearEditor();
                break;
            case 'o':
                e.preventDefault();
                openPreviewWindow();
                break;
            case 'n':
                e.preventDefault();
                addSlide();
                break;
            case 'i':
                e.preventDefault();
                if (imageInserter) {
                    imageInserter.showImageDialog();
                }
                break;
            case 'r':
                e.preventDefault();
                manualRestore();
                break;
        }
    }
});

// ページ離脱時の警告
window.addEventListener('beforeunload', (e) => {
    if (autoSave && autoSave.hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '未保存の変更があります。本当にページを離れますか？';
        return e.returnValue;
    }
});
