function copyLink() {
	/* Get the text field */
	var copyText = document.getElementById('share');

	/* Select the text field */
	copyText.select();
	copyText.setSelectionRange(0, 99999); /* For mobile devices */

	/* Copy the text inside the text field */
	document.execCommand('copy');
	navigator.clipboard.writeText(copyText.value);
	console.log(copyText.value);

	var x = document.getElementById('toast');
	x.classList.add('show');
	setTimeout(function () {
		x.className = x.className.replace('show', '');
	}, 2000);
}
