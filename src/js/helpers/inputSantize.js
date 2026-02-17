class InputSanitize {
    constructor(element) {
        this.inputElement = element;
        this.emojiRegex = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDE4F]|\uD83D[\uDE80-\uDEFF]|\uD83E[\uDD00-\uDDFF])/g;

        this.init();
    }

    get inputValue() {
        return this.inputElement.value.trim().replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '');
    }

    handleInput() {
        let value = this.sanitizeEmoji(this.inputValue); 
        this.inputElement.value = value;
    }

    handleKeyDown(event) {
        // Check if the character is an emoji
        if (this.emojiRegex.test(event.key)) {
            // alert("Emoji")
            event.preventDefault();
            return;
        }

        if (this.inputElement.value.length >= this.inputElement.maxLength) {
            event.preventDefault();
            return;
        }
    }

    handlePaste(event) {
        event.preventDefault();
        let paste = (event.clipboardData || window.clipboardData).getData('text');
        paste = this.sanitizeEmoji(paste); 

        const start = this.inputElement.selectionStart;
        const end = this.inputElement.selectionEnd;

        // Check remaining length to prevent exceeding maxLength
        const remainingLength = this.inputElement.maxLength - this.inputElement.value.length + (end - start);
        if (paste.length > remainingLength) {
            paste = paste.substring(0, remainingLength);
        }

        // Insert the sanitized paste content at the cursor position
        this.inputElement.value = this.inputElement.value.slice(0, start) + paste + this.inputElement.value.slice(end);
        this.inputElement.setSelectionRange(start + paste.length, start + paste.length);
    }

    sanitizeEmoji(value) {
        let strCopy = value;
        const emojiKeycapRegex = /[\u0023-\u0039]\ufe0f?\u20e3/g;
        const emojiRegex = /\p{Extended_Pictographic}/gu;
        const emojiComponentRegex = /\p{Emoji_Component}/gu;
        if (emojiKeycapRegex.test(strCopy)) {
            strCopy = strCopy.replace(emojiKeycapRegex, '');
        }
        if (emojiRegex.test(strCopy)) {
            strCopy = strCopy.replace(emojiRegex, '');
        }
        if (emojiComponentRegex.test(strCopy)) {
            // eslint-disable-next-line no-restricted-syntax
            for (const emoji of (strCopy.match(emojiComponentRegex) || [])) {
                if (/[\d|*|#]/.test(emoji)) {
                    continue;
                }
                strCopy = strCopy.replace(emoji, '');
            }
        }

        return strCopy;
    }
 

    init() {
        this.inputElement.addEventListener('input', this.handleInput.bind(this));
        this.inputElement.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.inputElement.addEventListener('paste', this.handlePaste.bind(this));
    }
}



const inputElements = document.querySelectorAll("[input-sanitize]");
if (inputElements.length > 0) {
    inputElements.forEach(inputElement => {
        new InputSanitize(inputElement);
    })
}
