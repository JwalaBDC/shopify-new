let inputElements = document.querySelectorAll(
    "[type='search']:not(.-allowEmoji), [type='text']:not(.-allowEmoji)"
);
if (inputElements.length) {
    inputElements.forEach((inputElement) => {
        function validateInput() {
            const inputValue = inputElement.value;
            const emojiRegex =
                /[\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Emoji_Presentation}|\p{Emoji}\uFE0F/gu; // Emoji regex pattern

            if (emojiRegex.test(inputValue)) {
                // Emoji detected in input, remove it
                inputElement.value = inputValue.replace(emojiRegex, "");
            }
        }
        inputElement.addEventListener("input", validateInput);
    });
} 


/* Allow Only alphanumeric */
function allowOnlyNumbersText(event) {
    let inputValue = event.target.value; 
    const regex = /[^a-zA-Z0-9\s]/gi;
    inputValue = inputValue.replace(regex, ""); // Replace non-alphanumeric characters with an empty string
    event.target.value = inputValue;
}
/* Allow Only Letters */
function allowOnlyLetters(event) {
    let inputValue = event.target.value;
    inputValue = inputValue.replace(/[^a-z ]/gi, "");
    inputValue = inputValue.replace("  ", " ");
    event.target.value = inputValue;
    event = event ? event : window.event;
    var charCode = event.which ? event.which : event.keyCode;
    // allow letters and whitespaces only.
    if (
        charCode != 32 &&
        charCode > 31 &&
        (charCode < 65 || charCode > 90) &&
        (charCode < 97 || charCode > 122)
    ) {
        event.preventDefault();
    }
}
/* On Mobile Input */
function allowOnlyNumbers(event) {
    /* allowOnlyNumbers */
    let inputValue = event.target.value;
    inputValue = inputValue.replace(/[^\d]/g, "");
    event.target.value = inputValue;
    event = event ? event : window.event;
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode != 43 && charCode > 31 && (charCode < 48 || charCode > 57)) {
        event.preventDefault();
    }
}

function handlePasteOnlyNumbers(event) {
    // Prevent paste if content is not a number
    const clipboardData = event.clipboardData || window.clipboardData;
    const pastedData = clipboardData.getData("Text");
    if (pastedData.match(/[^0-9]/)) {
        event.preventDefault();
    }
} 


document.addEventListener("DOMContentLoaded", function () {
    var allowOnlyNumberText = document.querySelectorAll(".-allowOnlyNumberText");

    if (allowOnlyNumberText.length > 0) {
        allowOnlyNumberText.forEach((input) =>
            input.addEventListener("keypress", allowOnlyNumbersText)
        );
        allowOnlyNumberText.forEach((input) =>
            input.addEventListener("input", allowOnlyNumbersText)
        );
    }

    var numberInputs = document.querySelectorAll(".-allowOnlyNumber");
    if (numberInputs.length > 0) {
        numberInputs.forEach((input) =>
            input.addEventListener("keypress", allowOnlyNumbers)
        );
        numberInputs.forEach((input) =>
            input.addEventListener("paste", handlePasteOnlyNumbers)
        );
    }

    var textInputs = document.querySelectorAll(".-allowOnlyText");
    if (textInputs.length > 0) {
        textInputs.forEach((input) =>
            input.addEventListener("keypress", allowOnlyLetters)
        );
        textInputs.forEach((input) =>
            input.addEventListener("input", allowOnlyLetters)
        );
    }
});
