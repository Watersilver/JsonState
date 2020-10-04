/**
 * https://gist.github.com/lyquix-owner/2ad6459672c1b8ec826b0b59f4e220d3
 * Super simple encryption utilities
 * Inspired by https://gist.github.com/sukima/5613286
 * Properly handles UTF-8 strings
 * Use these functions at your own risk: xor encryption provides only acceptable
 * security when the key is random and longer than the message
 * If looking for more reliable security use: https://tweetnacl.js.org/
 *
 * Use passwordDerivedKey function in this file to generate a key from a password, or to generate a random key
 */
// Super simple XOR encrypt function
export function encrypt(key, plaintext) {
	let cyphertext = [];
	// Convert to hex to properly handle UTF8
	plaintext = Array.from(plaintext).map(function(c) {
		if(c.charCodeAt(0) < 128) return c.charCodeAt(0).toString(16).padStart(2, '0');
		else return encodeURIComponent(c).replace(/\%/g,'').toLowerCase();
	}).join('');
	// Convert each hex to decimal
	plaintext = plaintext.match(/.{1,2}/g).map(x => parseInt(x, 16));
	// Perform xor operation
	for (let i = 0; i < plaintext.length; i++) {
		cyphertext.push(plaintext[i] ^ key.charCodeAt(Math.floor(i % key.length)));
	}
	// Convert to hex
	cyphertext = cyphertext.map(function(x) {
		return x.toString(16).padStart(2, '0');
	});
	return cyphertext.join('');
}

// Super simple XOR decrypt function
export function decrypt(key, cyphertext) {
	try {
		cyphertext = cyphertext.match(/.{1,2}/g).map(x => parseInt(x, 16));
		let plaintext = [];
		for (let i = 0; i < cyphertext.length; i++) {
			plaintext.push((cyphertext[i] ^ key.charCodeAt(Math.floor(i % key.length))).toString(16).padStart(2, '0'));
		}
		return decodeURIComponent('%' + plaintext.join('').match(/.{1,2}/g).join('%'));
	}
	catch(e) {
		return false;
	}
}

// Super simple password to 256-bit key function
function passwordDerivedKey(password, salt, iterations, len) {
	if(!password) password = randomStr();
	if(!salt) salt = '80ymb4oZ';
	if(!iterations) iterations = 8;
	if(!len) len = 256;
	len = Math.ceil(len / 8);
	var key = '';

	while(key.length < len) {
		var i = 0;
		var intSalt = salt;
		var intKey = '';
		while(i < iterations) {
			intKey = hash(password + intSalt);
			var newSalt = '';
			for(let j = 0; j < intSalt.length; j++) {
				newSalt += (intSalt.charCodeAt(j) ^ intKey.charCodeAt(Math.floor(j % intKey.length))).toString(36);
			}
			intSalt = newSalt;
			i++;
		}
		key += intKey;
	}
	return key.substring(0, len);
}

// Generates a random string of the specificed length
function randomStr(len) {
	var str = parseInt(Math.random()*10e16).toString(36);
	if(typeof len == 'undefined') return str;
	else {
		while(str.length < len) {
			str += parseInt(Math.random()*10e16).toString(36);
		}
		return str.substring(str.length - len);
	}
}

// Super simple hash function
function hash(str) {
	for(var i = 0, h = 4641154056; i < str.length; i++) h = Math.imul(h + str.charCodeAt(i) | 0, 2654435761);
	h = (h ^ h >>> 17) >>> 0;
	return h.toString(36);
}