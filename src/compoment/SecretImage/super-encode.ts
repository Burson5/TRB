(function(window) {
  let deOriginKey = 'g0MW7KcyAX6DaEBT5fsP';
  let allKey = '';
  let deAllKey = '';
  let iv = '';
  let deIv = '';
  let PADDING = decodeURIComponent('%00');
  let replacePADDING = new RegExp(PADDING, 'g');
  let check = () => {
    return true;
  };

  let encode = (paramMessage, paramKey, paramIvs) => {
    if (!paramMessage) {
      return '';
    }
    let ivs = paramIvs;
    let key = paramKey;
    let message = paramMessage;
    if (ivs) {
      ivs = Crypto.enc.Utf8.parse(ivs);
    }
    ivs = ivs || iv;
    key = key || allKey;

    message = message + PADDING.repeat(16 - (message.length % 16));
    let encrypt = Crypto.AES.encrypt(message, Crypto.enc.Utf8.parse(key), {
      mode: Crypto.mode.CBC,
      iv: ivs,
      padding: Crypto.pad.ZeroPadding,
    });
    return encrypt.toString();
  };

  let decode = (paramEncrypt, paramKey, paramIvs) => {
    if (!paramEncrypt) {
      return '';
    }
    let ivs = paramIvs;
    let key = paramKey;
    let encrypt = paramEncrypt;
    if (ivs) {
      ivs = Crypto.enc.Utf8.parse(ivs);
    }
    ivs = ivs || deIv;
    key = key || deAllKey;
    let decrypt = Crypto.AES.decrypt(encrypt, Crypto.enc.Utf8.parse(key), {
      mode: Crypto.mode.CBC,
      iv: ivs,
    });

    let res = decrypt.toString(Crypto.enc.Utf8).replace(replacePADDING, '');
    return res;
  };
  window.superEncoder = {
    isLoaded: true,
    encode: (encrypt, key, paramIv) => {
      if (check()) {
        return encode(encrypt, key, paramIv);
      } else {
        return '';
      }
    },
    decode: (encrypt, key, paramIv) => {
      if (check()) {
        return decode(encrypt, key, paramIv);
      } else {
        return '';
      }
    },
    setFunKey: oldKey => {
      // originKey = oldKey;
      deOriginKey = oldKey;
      allKey = oldKey.substr(0, 16);
      iv = Crypto.enc.Utf8.parse(oldKey.substr(oldKey.length - 16));

      deAllKey = deOriginKey.substr(1, 16);
      deIv = Crypto.enc.Utf8.parse(
        deOriginKey.substr(deOriginKey.length - 17, 16)
      );
    },
  };
})(window);
