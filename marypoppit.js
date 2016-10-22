// MaryPoppit.js - hides data in data
// (c) 2016 Inti De Ceukelaire <inti.de.ceukelaire@gmail.com>
// License: GNU
// URL: https://github.com/IntiDC/marypoppit

var Mary = {
	defaultChars : ["\u200c", "\u200d", "\u200e"],
	settings : {
		timesValue : 2
	},
	pack : function(text = "", _secret = "", options = {chars : this.defaultChars, afterValue : this.settings.afterValue, timesValue : this.settings.timesValue}){ //This particular piece of code will never get me any prize for programming skills, but hey; it works
				console.log("Packing with the following settings:");
				console.log(this.settings);
				var result;
				var inTag;
				var htmlEnt = 0; //Ugly hack to prevent tokens from being added in a HTML tag
				var actualSize = 0;
				var inc;
				var secret;
				var timesValue = options.timesValue + 1; //small hack to avoid an injection in the beginning
				var pos = [];
		for(var j = 0; j < 2; j++){ //First we calculate the length of the string without tags and entities, then we insert our hidden tokens
				result = "";
				if(j == 1){
					if(options.afterValue != undefined){
							timesValue = Math.floor(actualSize / options.afterValue);
					}
					if(options.afterValue > actualSize){
							timesValue = 2;
					}
					if(timesValue == 0){
						inc = 1;
						timesValue = text.length; 
					}
					else{
						inc = actualSize / timesValue;
					}
					for(var i = 0; i < timesValue; i++){ pos.push(Math.round(i * inc))}
					console.log(pos);
					actualSize = 0;
				}
				for(var i = 0; i < text.length; i++){
				//We don't want to inject stuff in HTML tags
						if(actualSize != undefined){
							 secret = this.encode(_secret, options.chars);
						}
						else{
							secret = "";
						}
						if(text[i] == "<"){
                         if(pos.indexOf(actualSize) > -1)
                   		 result += secret;
								inTag = true;
						}
						//Not in HTML entities either
						var entity = text.substr(i, 8).match(/^&(.*?);/g);
						htmlEnt = 0;
						if(entity){
							htmlEnt =  entity[0].length;
 
                         if(pos.indexOf(actualSize) > -1)
								result += secret;
							result = result +  secret + text.substr(i, htmlEnt);
						}
						if((!inTag) && pos.indexOf(actualSize) > -1){
							result += secret;
						}
						if(text[i] == ">"){
							inTag = false;
						}
						i += htmlEnt;
						actualSize += htmlEnt;
		                if(text[i] != undefined){
								result += text[i];
						}
						if(!inTag){
							actualSize++;
						}
				}
		}
		return result.substr(secret.length, result.length); //remove the first injection
},
	unpack : function(text, options = {
		chars : this.defaultChars
	}){		
		var re = new RegExp(options.chars[2]+"\[^"+options.chars[2]+"]+"+options.chars[2], 'g');
		var results = [];
		var extracts = text.match(re);
		for(var i = 0; i < extracts.length; i++){
			var decoded = this.decode(extracts[i], options.chars); 
			if(results.indexOf(decoded) == -1){
				results.push(decoded);	
			}
		}
		return results;
	},
	encode : function(text, chars){
			var binary = conv.toBinary(text, false);
			binary = binary.replace(/0/g, chars[0]).replace(/1/g, chars[1]);
			return chars[2] + binary + chars[2];
	},
	decode : function(text, chars){
			var r0 = new RegExp(chars[0],"g");
			var r1 = new RegExp(chars[1],"g");
			var r = new RegExp(chars[2],"g");
			var ascii = text.replace(r, "").replace(r0, "0").replace(r1, "1");
			return conv.toAscii(ascii);
	}

}


String.prototype.pack = function(secret, options){
		return Mary.pack(this, secret, options);
}

String.prototype.unpack = function(options){
		return Mary.unpack(this, options);
}

// ABC - a generic, native JS (A)scii(B)inary(C)onverter.
// (c) 2013 Stephan Schmitz <eyecatchup@gmail.com>
// License: MIT, http://eyecatchup.mit-license.org
// URL: https://gist.github.com/eyecatchup/6742657

var conv = {
  toAscii: function(bin) {
    return bin.replace(/\s*[01]{8}\s*/g, function(bin) {
      return String.fromCharCode(parseInt(bin, 2))
    })
  },
  toBinary: function(str, spaceSeparatedOctets) {
    return str.replace(/[\s\S]/g, function(str) {
      str = conv.zeroPad(str.charCodeAt().toString(2));
      return !1 == spaceSeparatedOctets ? str : str + " "
    })
  },
  zeroPad: function(num) {
    return "00000000".slice(String(num).length) + num
  }
};

