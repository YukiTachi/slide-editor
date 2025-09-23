// 画像挿入機能クラス
class ImageInserter {
    constructor(editorId) {
        this.editor = document.getElementById(editorId);
        this.maxBase64Size = 1024 * 1024; // 1MB以下はBase64
        this.imagesFolder = 'images/'; // 画像保存フォルダ
        this.imageCounter = 1; // 画像ファイル名のカウンター
        this.setupEventListeners();
        this.setupDragDrop();
        this.initializeImagesFolder();
    }

    setupEventListeners() {
        const imageBtn = document.getElementById('imageInsertBtn');
        imageBtn.addEventListener('click', () => this.showImageDialog());
    }

    initializeImagesFolder() {
        // 画像フォルダが存在しない場合は作成（実際のファイルシステムでは動作しないため、ローカルストレージで管理）
        if (!localStorage.getItem('slideEditorImages')) {
            localStorage.setItem('slideEditorImages', JSON.stringify({}));
        }
    }

    generateImageFileName(originalName) {
        const extension = originalName.split('.').pop().toLowerCase();
        const timestamp = new Date().getTime();
        const counter = this.imageCounter++;
        return `image_${timestamp}_${counter}.${extension}`;
    }

    saveImageToStorage(file, fileName) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const images = JSON.parse(localStorage.getItem('slideEditorImages') || '{}');
                images[fileName] = {
                    data: e.target.result,
                    originalName: file.name,
                    size: file.size,
                    type: file.type,
                    timestamp: new Date().getTime()
                };
                localStorage.setItem('slideEditorImages', JSON.stringify(images));
                resolve(fileName);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    getImageFromStorage(fileName) {
        const images = JSON.parse(localStorage.getItem('slideEditorImages') || '{}');
        return images[fileName] ? images[fileName].data : null;
    }

    // ローカルストレージの画像をdata URIに変換する機能
    convertStorageImagesToDataURI(htmlContent) {
        const images = JSON.parse(localStorage.getItem('slideEditorImages') || '{}');
        let processedContent = htmlContent;
        
        // images/filename.ext パターンを検索してdata URIに置換
        const imagePathRegex = /src="images\/([^"]+)"/g;
        const matches = [...processedContent.matchAll(imagePathRegex)];
        
        for (const match of matches) {
            const fileName = match[1];
            const imageData = this.getImageFromStorage(fileName);
            if (imageData) {
                processedContent = processedContent.replace(
                    `src="images/${fileName}"`,
                    `src="${imageData}"`
                );
            }
        }
        
        return processedContent;
    }

    // プレビュー用のHTML処理
    processHTMLForPreview(htmlContent) {
        return this.convertStorageImagesToDataURI(htmlContent);
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
        
        // 設定オプション
        const settingsDiv = document.createElement('div');
        settingsDiv.className = 'image-settings';
        settingsDiv.innerHTML = `
            <label>
                <input type="radio" name="imageMode" value="external" checked> 
                📁 外部ファイルとして保存（HTMLが読みやすい）
            </label>
            <label>
                <input type="radio" name="imageMode" value="base64"> 
                🔗 Base64で埋め込み（1ファイルで完結）
            </label>
        `;
        
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
        modal.appendChild(settingsDiv);
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
        const imageMode = document.querySelector('input[name="imageMode"]:checked')?.value || 'external';
        
        if (imageMode === 'external') {
            this.insertAsExternalFile(file);
        } else {
            if (file.size <= this.maxBase64Size) {
                this.insertAsBase64(file);
            } else {
                this.showSizeWarning(file);
            }
        }
    }

    async insertAsExternalFile(file) {
        try {
            const fileName = this.generateImageFileName(file.name);
            await this.saveImageToStorage(file, fileName);
            
            // 外部ファイル参照として挿入（HTMLエディタには外部参照、プレビューではdata URI）
            this.insertImageWithSplitLayout(null, file.name, fileName);
            this.showSuccessMessage(`画像 "${file.name}" を外部ファイルとして保存しました`);
        } catch (error) {
            console.error('画像保存エラー:', error);
            alert('画像の保存に失敗しました。');
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

    insertImageWithSplitLayout(imageSrc, imageName, fileName = null) {
        const cursorPos = this.editor.selectionStart;
        const htmlContent = this.editor.value;
        
        // 現在のカーソル位置がどのスライド内にあるかを特定
        const currentSlide = this.findCurrentSlide(htmlContent, cursorPos);
        
        if (currentSlide) {
            // 現在のスライドを2分割レイアウトに変換
            const splitSlide = this.convertToSplitLayout(currentSlide.content, imageSrc, imageName, fileName);
            
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
            const imageTag = fileName ? 
                `<img src="${this.imagesFolder}${fileName}" alt="${imageName}"` :
                `<img src="${imageSrc}" alt="${imageName}"`;
                
            this.insertToEditor(`
        <div style="text-align: center; margin: 30px 0;">
            ${imageTag} 
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

    convertToSplitLayout(slideContent, imageSrc, imageName, fileName = null) {
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
        
        // 画像のsrc属性を決定
        const imageSrcAttr = fileName ? 
            `${this.imagesFolder}${fileName}` : 
            imageSrc;
        
        // 2分割レイアウトのHTMLを生成
        return `<div class="slide slide-split">
        ${title}
        <div class="slide-split-content">
            <div class="slide-content">
${contentWithoutTitleAndFooter.trim()}
            </div>
            <div class="slide-image">
                <img src="${imageSrcAttr}" alt="${imageName}">
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

    // base64画像を外部ファイル参照に変換する機能
    convertBase64ImagesToExternal() {
        const htmlContent = this.editor.value;
        const base64Regex = /<img[^>]*src="data:image\/[^;]+;base64,[^"]+"[^>]*>/g;
        const matches = htmlContent.match(base64Regex);
        
        if (!matches || matches.length === 0) {
            alert('変換可能なbase64画像が見つかりませんでした。');
            return;
        }
        
        if (confirm(`${matches.length}個のbase64画像を外部ファイル参照に変換しますか？\n（HTMLが読みやすくなります）`)) {
            this.processBase64Conversions(htmlContent, matches);
        }
    }

    async processBase64Conversions(htmlContent, matches) {
        let newHtmlContent = htmlContent;
        let convertedCount = 0;
        
        for (const match of matches) {
            try {
                // base64データを抽出
                const base64Match = match.match(/src="(data:image\/[^;]+;base64,[^"]+)"/);
                if (!base64Match) continue;
                
                const base64Data = base64Match[1];
                const altMatch = match.match(/alt="([^"]*)"/);
                const altText = altMatch ? altMatch[1] : 'converted_image';
                
                // base64データからファイル名を生成
                const mimeType = base64Data.match(/data:image\/([^;]+);/);
                const extension = mimeType ? mimeType[1] : 'png';
                const fileName = `converted_${Date.now()}_${convertedCount}.${extension}`;
                
                // base64データをローカルストレージに保存
                const images = JSON.parse(localStorage.getItem('slideEditorImages') || '{}');
                images[fileName] = {
                    data: base64Data,
                    originalName: altText,
                    size: (base64Data.length * 3) / 4, // 概算サイズ
                    type: `image/${extension}`,
                    timestamp: new Date().getTime()
                };
                localStorage.setItem('slideEditorImages', JSON.stringify(images));
                
                // HTML内のbase64参照を外部ファイル参照に置換
                const newImageTag = match.replace(
                    /src="data:image\/[^;]+;base64,[^"]+"/,
                    `src="${this.imagesFolder}${fileName}"`
                );
                
                newHtmlContent = newHtmlContent.replace(match, newImageTag);
                convertedCount++;
                
            } catch (error) {
                console.error('画像変換エラー:', error);
            }
        }
        
        if (convertedCount > 0) {
            this.editor.value = newHtmlContent;
            this.showSuccessMessage(`${convertedCount}個の画像を外部ファイル参照に変換しました`);
            if (window.updatePreview) {
                window.updatePreview();
            }
        } else {
            alert('画像の変換に失敗しました。');
        }
    }

    // 画像管理機能を追加
    showImageManager() {
        const images = JSON.parse(localStorage.getItem('slideEditorImages') || '{}');
        const imageList = Object.keys(images);
        
        if (imageList.length === 0) {
            alert('保存されている画像がありません。');
            return;
        }
        
        const overlay = document.createElement('div');
        overlay.className = 'image-modal-overlay';
        
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.style.maxWidth = '600px';
        
        modal.innerHTML = `
            <h3>📁 画像管理</h3>
            <div class="image-list">
                ${imageList.map(fileName => {
                    const image = images[fileName];
                    const sizeKB = (image.size / 1024).toFixed(1);
                    return `
                        <div class="image-item">
                            <img src="${image.data}" alt="${image.originalName}" style="width: 50px; height: 50px; object-fit: cover;">
                            <div class="image-info">
                                <strong>${image.originalName}</strong><br>
                                <small>${fileName} (${sizeKB}KB)</small>
                            </div>
                            <button onclick="imageInserter.deleteImage('${fileName}')" class="delete-btn">🗑️</button>
                        </div>
                    `;
                }).join('')}
            </div>
            <button class="cancel-btn" onclick="this.closest('.image-modal-overlay').remove()">閉じる</button>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    deleteImage(fileName) {
        if (confirm(`画像 "${fileName}" を削除しますか？`)) {
            const images = JSON.parse(localStorage.getItem('slideEditorImages') || '{}');
            delete images[fileName];
            localStorage.setItem('slideEditorImages', JSON.stringify(images));
            
            // 画像管理モーダルを再表示
            document.querySelector('.image-modal-overlay')?.remove();
            this.showImageManager();
            
            this.showSuccessMessage('画像を削除しました');
        }
    }
}
