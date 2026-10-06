<div x-data="{ show: true }"
     x-init="window.addEventListener('mobile-menu-toggle', e => { show = !e.detail.open; if (e.detail.open) { var p = document.getElementById('ai-chat-panel'); if (p && p.style.display !== 'none') { p.style.display = 'none'; } } })"
     x-show="show">
    <button id="ai-chat-toggle"
            type="button"
            onclick="toggleAiChatPanel()"
            style="position: fixed; right: 1rem; bottom: 5rem; z-index: 9999;"
            class="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-700 to-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:from-emerald-600 hover:to-emerald-500 hover:shadow-xl transition-all duration-200">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
        </svg>
        <span>Konsultasi SPMB</span>
    </button>
</div>

<div id="ai-chat-panel"
     style="display: none; position: fixed; left: 0; right: 0; top: 5rem; bottom: 6.5rem; z-index: 9998;"
     class="px-3 sm:px-6">
    <div class="flex h-full w-full max-w-3xl mx-auto flex-col rounded-2xl bg-white shadow-2xl border border-emerald-100 overflow-hidden">
        <div x-data="aiChatWidget()" class="flex flex-1 flex-col overflow-hidden">
            <div class="flex items-center justify-between bg-gradient-to-r from-emerald-700 to-emerald-600 px-4 sm:px-5 py-3 text-white">
                <div class="flex items-center gap-3">
                    <div class="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                        </svg>
                    </div>
                    <div>
                        <div class="text-sm font-semibold leading-tight">Asisten SPMB</div>
                        <div class="text-xs text-white/80">Tanyakan informasi pendaftaran SMA Persis Serang</div>
                    </div>
                </div>
                <button type="button" onclick="toggleAiChatPanel()" class="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors" title="Tutup chat" aria-label="Tutup chat">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>

            <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-3 bg-gray-50" x-ref="messagesContainer">
                <template x-for="(msg, i) in messages" :key="i">
                    <div :class="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'">
                        <div :class="msg.role === 'user'
                            ? 'bg-emerald-600 text-white rounded-2xl rounded-br-md px-4 py-2.5 max-w-[85%] sm:max-w-xl lg:max-w-2xl'
                            : 'bg-white text-gray-800 rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[85%] sm:max-w-2xl lg:max-w-3xl shadow-sm border border-gray-100'">
                            <div class="text-sm leading-relaxed text-left [&_ul]:my-1 [&_li]:text-sm [&_a]:break-all" x-html="renderMessage(msg.content)"></div>
                        </div>
                    </div>
                </template>
                <div x-show="loading" class="flex justify-start">
                    <div class="bg-white text-gray-500 rounded-2xl rounded-bl-md px-4 py-3 text-sm shadow-sm border border-gray-100">
                        Asisten sedang mengetik...
                    </div>
                </div>
            </div>

            <div class="border-t border-gray-100 px-4 sm:px-6 py-3 bg-white">
                <form @submit.prevent="sendMessage" class="flex gap-2">
                    <input type="text" x-model="input" x-ref="inputField"
                           placeholder="Tanyakan tentang SPMB..."
                           maxlength="500"
                           class="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:ring-emerald-500 placeholder:text-gray-400"
                           :disabled="loading">
                    <button type="submit" :disabled="loading || !input.trim()"
                            class="rounded-xl bg-emerald-600 px-3.5 py-2.5 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19V5m0 0l-7 7m7-7l7 7"/>
                        </svg>
                    </button>
                </form>
                <p class="text-[10px] text-gray-400 mt-1.5 text-center">AI bisa salah. Jika perlu panitia, ketik: nomor WA.</p>
            </div>
        </div>
    </div>
</div>

<style>
@media (max-width: 640px) {
    #ai-chat-panel {
        top: 4rem !important;
        bottom: 5.5rem !important;
    }
}
</style>

<script>
function aiChatWidget() {
    return {
        input: '',
        messages: [
            {
                role: 'assistant',
                content: 'Halo! Saya Asisten SPMB SMA Persis Serang. Ada yang ingin ditanyakan seputar pendaftaran, biaya, asrama, atau program sekolah?'
            }
        ],
        loading: false,

        init() {
            if (localStorage.getItem('ai-chat-messages')) {
                try {
                    const saved = JSON.parse(localStorage.getItem('ai-chat-messages'));
                    if (Array.isArray(saved) && saved.length > 0) {
                        this.messages = saved;
                    }
                } catch (e) {}
            }
        },

        escapeHtml(text) {
            const div = document.createElement('div');
            div.appendChild(document.createTextNode(text || ''));
            return div.innerHTML;
        },

        renderMessage(text) {
            try {
                var html = this.escapeHtml(text);

                html = html.replace(/089661234569/g, '<a href="https://wa.me/6289661234569" target="_blank" rel="noopener noreferrer" class="text-emerald-600 underline font-semibold hover:text-emerald-700">089661234569</a>');

                html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

            var lines = html.split('\n');
            var out = [];
            var inList = false;

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                var bullet = line.match(/^[\u2022\-]\s*(.*)/);

                if (bullet) {
                    if (!inList) {
                        out.push('<ul class="list-disc pl-5 space-y-0.5 my-1">');
                        inList = true;
                    }
                    out.push('<li>' + (bullet[1] || '') + '</li>');
                } else {
                    if (inList) {
                        out.push('</ul>');
                        inList = false;
                    }
                    if (line.trim() === '') {
                        out.push('<br>');
                    } else {
                        out.push('<p class="mb-1 last:mb-0">' + line + '</p>');
                    }
                }
            }

            if (inList) {
                out.push('</ul>');
            }

            return out.join('\n');
        } catch (error) {
            console.error('Render message error:', error);
            return this.escapeHtml(text || '');
        }
        },

        async sendMessage() {
            var msg = this.input.trim();
            if (!msg || this.loading) return;

            this.messages.push({ role: 'user', content: msg });
            this.input = '';
            this.loading = true;
            this.$nextTick(function() { this.scrollToBottom(); }.bind(this));
            this.saveMessages();

            try {
                var response = await fetch('{{ route("ai-chat.send") }}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                    },
                    body: JSON.stringify({ message: msg }),
                });
                var data = await response.json();
                var reply = data.reply || data.answer || 'Maaf, saya belum bisa menjawab saat ini.';
                this.loading = false;
                await this.typeBotMessage(reply);
            } catch (e) {
                this.loading = false;
                await this.typeBotMessage('Maaf, terjadi kendala. Silakan coba lagi.');
            }
        },

        getTypingDelay(chunk) {
            if (chunk.includes('\n')) return 120;
            if (/[.!?]/.test(chunk)) return 90;
            if (/,/.test(chunk)) return 50;
            return 25;
        },

        async typeBotMessage(fullText) {
            var safeText = fullText || '';

            this.messages.push({
                role: 'assistant',
                content: '',
                typing: true
            });

            var messageIndex = this.messages.length - 1;
            var chunkSize = safeText.length > 500 ? 3 : 2;

            try {
                for (var idx = 0; idx < safeText.length; idx += chunkSize) {
                    var end = Math.min(idx + chunkSize, safeText.length);
                    var current = safeText.slice(0, end);
                    var chunk = safeText.slice(idx, end);
                    var delay = this.getTypingDelay(chunk);

                    this.messages[messageIndex] = {
                        role: 'assistant',
                        content: current,
                        typing: true
                    };

                    this.messages = this.messages.slice();
                    this.$nextTick(function() { this.scrollToBottom(); }.bind(this));
                    await new Promise(function(resolve) { setTimeout(resolve, delay); });
                }

                this.messages[messageIndex] = {
                    role: 'assistant',
                    content: safeText,
                    typing: false
                };

                this.messages = this.messages.slice();
            } catch (error) {
                console.error('Typing effect error:', error);
                this.messages[messageIndex] = {
                    role: 'assistant',
                    content: safeText,
                    typing: false
                };
                this.messages = this.messages.slice();
            }

            this.saveMessages();
            this.$nextTick(function() { this.scrollToBottom(); }.bind(this));
        },

        scrollToBottom() {
            var container = this.$refs.messagesContainer;
            if (!container) return;
            container.scrollTop = container.scrollHeight;
        },

        saveMessages() {
            try {
                localStorage.setItem('ai-chat-messages', JSON.stringify(this.messages));
            } catch (e) {}
        }
    };
}

function toggleAiChatPanel() {
    var panel = document.getElementById('ai-chat-panel');
    if (!panel) return;
    if (panel.style.display === 'none' || panel.style.display === '') {
        panel.style.display = 'block';
        setTimeout(function() {
            var container = panel.querySelector('[x-ref="messagesContainer"]');
            if (container) container.scrollTop = container.scrollHeight;
            var input = panel.querySelector('[x-ref="inputField"]');
            if (input) input.focus();
        }, 100);
    } else {
        panel.style.display = 'none';
    }
}
</script>
