// 自動保存機能クラス
class AutoSave {
    constructor(editorId, statusElementId) {
        this.editor = document.getElementById(editorId);
        this.statusElement = document.getElementById(statusElementId);
        this.autoSaveKey = 'slideEditor_autoSave';
        this.timestampKey = 'slideEditor_lastSaved';
        this.saveInterval = 30000; // 30秒間隔
        this.intervalId = null;
        this.lastContent = '';
        
        this.init();
    }

    init() {
        // 自動保存開始
        this.startAutoSave();
        
        // エディタの変更を監視
        this.editor.addEventListener('input', () => {
            this.updateStatus('編集中...');
        });
        
        // ページ読み込み時に復元確認
        this.checkForRestore();
    }

    startAutoSave() {
        this.intervalId = setInterval(() => {
            this.autoSave();
        }, this.saveInterval);
    }

    stopAutoSave() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    autoSave() {
        const currentContent = this.editor.value;
        
        // 内容が変更されている場合のみ保存
        if (currentContent !== this.lastContent && currentContent.trim() !== '') {
            try {
                localStorage.setItem(this.autoSaveKey, currentContent);
                localStorage.setItem(this.timestampKey, new Date().toISOString());
                
                this.lastContent = currentContent;
                this.updateStatus('自動保存済み');
                
                console.log('自動保存完了:', new Date().toLocaleTimeString());
            } catch (error) {
                console.error('自動保存エラー:', error);
                this.updateStatus('保存エラー', 'error');
            }
        }
    }

    checkForRestore() {
        const savedContent = localStorage.getItem(this.autoSaveKey);
        const savedTimestamp = localStorage.getItem(this.timestampKey);
        
        if (savedContent && savedContent.trim() !== '') {
            const currentContent = this.editor.value;
            const defaultContent = window.defaultHTML;
            
            // 現在の内容がデフォルトと同じで、保存されたコンテンツがある場合
            if (currentContent === defaultContent && savedContent !== defaultContent) {
                this.showRestoreDialog(savedContent, savedTimestamp);
            } else if (savedContent !== currentContent) {
                this.updateStatus('未保存の変更があります');
            }
        }
    }

    showRestoreDialog(savedContent, timestamp) {
        const saveTime = timestamp ? new Date(timestamp).toLocaleString() : '不明';
        const message = `前回の編集内容が見つかりました。\n最終保存: ${saveTime}\n\n復元しますか？`;
        
        if (confirm(message)) {
            this.restore(savedContent);
        }
    }

    restore(content) {
        if (content) {
            this.editor.value = content;
            this.lastContent = content;
            if (window.updatePreview) {
                window.updatePreview();
            }
            this.updateStatus('復元完了');
            
            // カーソルを末尾に移動
            this.editor.focus();
            this.editor.setSelectionRange(content.length, content.length);
        }
    }

    manualRestore() {
        const savedContent = localStorage.getItem(this.autoSaveKey);
        const savedTimestamp = localStorage.getItem(this.timestampKey);
        
        if (savedContent) {
            const saveTime = savedTimestamp ? new Date(savedTimestamp).toLocaleString() : '不明';
            const message = `保存された内容を復元します。\n最終保存: ${saveTime}\n\n現在の内容は失われます。続行しますか？`;
            
            if (confirm(message)) {
                this.restore(savedContent);
            }
        } else {
            alert('復元できる内容がありません。');
        }
    }

    clearSaved() {
        if (confirm('保存されたデータを削除しますか？')) {
            localStorage.removeItem(this.autoSaveKey);
            localStorage.removeItem(this.timestampKey);
            this.updateStatus('保存データを削除しました');
        }
    }

    updateStatus(message, type = 'normal') {
        if (this.statusElement) {
            this.statusElement.textContent = message;
            this.statusElement.style.color = type === 'error' ? '#e74c3c' : 
                                            type === 'success' ? '#27ae60' : '';
            
            // 3秒後に通常状態に戻す
            setTimeout(() => {
                if (type !== 'normal') {
                    this.statusElement.style.color = '';
                }
            }, 3000);
        }
    }

    getLastSaveTime() {
        const timestamp = localStorage.getItem(this.timestampKey);
        return timestamp ? new Date(timestamp) : null;
    }

    hasUnsavedChanges() {
        const currentContent = this.editor.value;
        const savedContent = localStorage.getItem(this.autoSaveKey) || '';
        return currentContent !== savedContent;
    }
}

// グローバル関数（ボタンから呼び出し用）
function manualRestore() {
    if (window.autoSave) {
        window.autoSave.manualRestore();
    }
}

function clearAutoSave() {
    if (window.autoSave) {
        window.autoSave.clearSaved();
    }
}
