// 画像挿入機能クラス
class ImageInserter {
    constructor(editorId) {
        this.editor = document.getElementById(editorId);
        this.maxBase64Size = 1024 * 1024; // 1MB以下はBase64
        this.setupEventListeners();
        this.setupDragDrop();
    }

    setupEventListeners() {
        const imageBtn = document.getElementById('imageInsertBtn');
        imageBtn.addEventListener('click', () => this.showImageDialog());
    }

    showImageDialog() {
        // 既存のモーダルがあれば削除
        const existingModal = document.querySelector('.image-modal-overlay');
        if (existingModal) {
            existingModal.remove();
        }

        // モーダル要素を直接作成
        const overlay = document.createElement('div');
        overlay.className = 'image-modal-overlay';
        
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        
        const title = document.createElement('h3');
        title.textContent = '🖼️ 画像を挿入';
        
        const options = document.createElement('div');
        options.className = 'image-options';
        
        const fileBtn = document.createElement('button');
        fileBtn.className = 'file-btn';
        fileBtn.textContent = '📁 ファイルを選択';
        
        const urlBtn = document.createElement('button');
        urlBtn.className = 'url-btn';
        urlBtn.textContent = '🔗 URLから挿入';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'cancel-btn cancel';
        cancelBtn.textContent = '❌ キャンセル';
        
        const dropZone = document.createElement('div');
        dropZone.className = 'drop-zone';
        dropZone.innerHTML = '📎 ここに画像をドラッグ&ドロップ<br><small>対応形式: JPG, PNG, GIF, WebP</small>';
        
        // 要素を組み立て
        options.appendChild(fileBtn);
        options.appendChild(urlBtn);
        options.appendChild(cancelBtn);
        
        modal.appendChild(title);
        modal.appendChild(options);
        modal.appendChild(dropZone);
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // イベントリスナーを設定
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });

        fileBtn.addEventListener('click', () => {
            this.selectFile();
        });
        
        urlBtn.addEventListener('click', () => {
            this.insertByURL();
        });
        
        cancelBtn.addEventListener('click', () => {
            overlay.remove();
        });

        // ドロップゾーンのイベント
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            if (e.dataTransfer.files.length > 0) {
                this.handleFiles(e.dataTransfer.files);
                overlay.remove();
            }
        });
    }

    selectFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        input.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFiles(e.target.files);
                // モーダルを閉じる
                document.querySelector('.image-modal-overlay')?.remove();
            }
        });
        input.click();
    }

    handleFiles(files) {
        if (files.length === 0) return;
        
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                this.processFile(file);
            } else {
                alert(`${file.name} は画像ファイルではありません。`);
            }
        });
    }

    processFile(file) {
        if (file.size <= this.maxBase64Size) {
            this.insertAsBase64(file);
        } else {
            this.showSizeWarning(file);
        }
    }

    insertAsBase64(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.insertImageWithSplitLayout(e.target.result, file.name);
            this.showSuccessMessage(`画像 "${file.name}" を挿入しました`);
        };
        reader.readAsDataURL(file);
    }

    insertByURL() {
        const url = prompt('画像のURLを入力してください:');
        if (url && this.isValidURL(url)) {
            this.insertImageWithSplitLayout(url, '外部画像');
            this.showSuccessMessage('URLから画像を挿入しました');
            // モーダルを閉じる
            const modal = document.querySelector('.image-modal-overlay');
            if (modal) {
                modal.remove();
            }
        } else if (url) {
            alert('有効なURLを入力してください。');
        }
    }

    setupDragDrop() {
        this.editor.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.editor.classList.add('drag-over');
        });

        this.editor.addEventListener('dragleave', (e) => {
            // エディタの境界を完全に出た時のみクラスを削除
            if (!this.editor.contains(e.relatedTarget)) {
                this.editor.classList.remove('drag-over');
            }
        });

        this.editor.addEventListener('drop', (e) => {
            e.preventDefault();
            this.editor.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFiles(files);
            }
        });
    }

    insertImageWithSplitLayout(imageSrc, imageName) {
        const cursorPos = this.editor.selectionStart;
        const htmlContent = this.editor.value;
        
        // 現在のカーソル位置がどのスライド内にあるかを特定
        const currentSlide = this.findCurrentSlide(htmlContent, cursorPos);
        
        if (currentSlide) {
            // 現在のスライドを2分割レイアウトに変換
            const splitSlide = this.convertToSplitLayout(currentSlide.content, imageSrc, imageName);
            
            // 元のスライドを新しいスライドに置換
            const newHtmlContent = htmlContent.substring(0, currentSlide.start) + 
                                  splitSlide + 
                                  htmlContent.substring(currentSlide.end);
            
            this.editor.value = newHtmlContent;
            this.editor.focus();
            if (window.updatePreview) {
                window.updatePreview();
            }
        } else {
            // スライド内にいない場合は、従来通りの方法で挿入
            this.insertToEditor(`
        <div style="text-align: center; margin: 30px 0;">
            <img src="${imageSrc}" alt="${imageName}" 
                 style="max-width: 600px; max-height: 400px; width: auto; height: auto; 
                        border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
            <p style="font-size: 16px; color: #7f8c8d; margin-top: 10px; font-style: italic;">${imageName}</p>
        </div>`);
        }
    }

    findCurrentSlide(htmlContent, cursorPos) {
        const slideStartRegex = /<div class="slide">/g;
        const slides = [];
        let match;
        
        // すべてのスライドの開始位置を取得
        while ((match = slideStartRegex.exec(htmlContent)) !== null) {
            const start = match.index;
            const end = this.findSlideEnd(htmlContent, start);
            if (end !== -1) {
                slides.push({
                    start: start,
                    end: end,
                    content: htmlContent.substring(start, end)
                });
            }
        }
        
        // カーソル位置がどのスライド内にあるかを判定
        for (const slide of slides) {
            if (cursorPos >= slide.start && cursorPos <= slide.end) {
                return slide;
            }
        }
        
        return null;
    }

    findSlideEnd(htmlContent, slideStart) {
        let depth = 1;
        let pos = slideStart + '<div class="slide">'.length;
        
        while (pos < htmlContent.length && depth > 0) {
            const nextDivStart = htmlContent.indexOf('<div', pos);
            const nextDivEnd = htmlContent.indexOf('</div>', pos);
            
            if (nextDivEnd === -1) break;
            
            if (nextDivStart !== -1 && nextDivStart < nextDivEnd) {
                depth++;
                pos = nextDivStart + 4;
            } else {
                depth--;
                if (depth === 0) {
                    return nextDivEnd + 6;
                }
                pos = nextDivEnd + 6;
            }
        }
        
        return -1;
    }

    convertToSplitLayout(slideContent, imageSrc, imageName) {
        // スライドの内容を解析
        const slideMatch = slideContent.match(/<div class="slide"[^>]*>([\s\S]*)<\/div>$/);
        if (!slideMatch) return slideContent;
        
        const innerContent = slideMatch[1];
        
        // フッターを抽出
        const footerMatch = innerContent.match(/<div class="footer">[\s\S]*?<\/div>/);
        const footer = footerMatch ? footerMatch[0] : '';
        
        // h1タイトルを抽出
        const titleMatch = innerContent.match(/<h1[^>]*>[\s\S]*?<\/h1>/);
        const title = titleMatch ? titleMatch[0] : '';
        
        // タイトルとフッターを除いたコンテンツを取得
        let contentWithoutTitleAndFooter = innerContent;
        if (footerMatch) {
            contentWithoutTitleAndFooter = contentWithoutTitleAndFooter.replace(footerMatch[0], '');
        }
        if (titleMatch) {
            contentWithoutTitleAndFooter = contentWithoutTitleAndFooter.replace(titleMatch[0], '');
        }
        
        // 2分割レイアウトのHTMLを生成
        return `<div class="slide slide-split">
        ${title}
        <div class="slide-split-content">
            <div class="slide-content">
${contentWithoutTitleAndFooter.trim()}
            </div>
            <div class="slide-image">
                <img src="${imageSrc}" alt="${imageName}">
            </div>
        </div>
        ${footer}
    </div>`;
    }

    insertToEditor(htmlContent) {
        const cursorPos = this.editor.selectionStart;
        const textBefore = this.editor.value.substring(0, cursorPos);
        const textAfter = this.editor.value.substring(cursorPos);
        
        this.editor.value = textBefore + htmlContent + textAfter;
        
        // カーソル位置を挿入した内容の後に移動
        const newCursorPos = cursorPos + htmlContent.length;
        this.editor.setSelectionRange(newCursorPos, newCursorPos);
        this.editor.focus();
        
        if (window.updatePreview) {
            window.updatePreview();
        }
    }

    isValidURL(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }

    showSizeWarning(file) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        if (confirm(`画像サイズが${sizeMB}MBと大きいです。Base64で埋め込みますか？\n（HTMLファイルが大きくなります）`)) {
            this.insertAsBase64(file);
        }
    }

    showSuccessMessage(message) {
        const statusText = document.getElementById('statusText');
        const originalText = statusText.textContent;
        statusText.textContent = message;
        statusText.style.color = '#27ae60';
        setTimeout(() => {
            statusText.textContent = originalText;
            statusText.style.color = '';
        }, 3000);
    }
}
