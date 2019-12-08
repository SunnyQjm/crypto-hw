const forge = require('node-forge');

const rootPublicKeyPem = "-----BEGIN PUBLIC KEY-----\n" +
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA+Wpkr2TsXJk6KadhQmdq\n" +
    "iV8PD/BcE4vUR35oC26U2PU0IepfkPsZoSATLD4M//UT9RzA10EKR6QeI4dlGxwJ\n" +
    "KgX0OlLtUssohp/CQ0MCqEMcm0OwBLyAVqFwxQdMyuAbWdjrgNHBhauWTFpiYjvu\n" +
    "LOoRgAFjEXJDx0wpZBjZg5MW+Y8gmVGGzcLJxsFCLAXl/U7akayrl0+V2QRnF2Pk\n" +
    "tfXWZUetEkuu3xcezMQZcY/R2wnWBE3PdgTQWezhZmaY8pB93BVwANmnMlQx+7b4\n" +
    "29bXScP3gkivz73rIaH9egeY1LlKsgjTK7g2/7IICBTgjTI3rkLmAxn7tGomBk/Z\n" +
    "2wIDAQAB\n" +
    "-----END PUBLIC KEY-----\n";

const rootPrivateKeyPem = "-----BEGIN RSA PRIVATE KEY-----\n" +
    "MIIEpQIBAAKCAQEA+Wpkr2TsXJk6KadhQmdqiV8PD/BcE4vUR35oC26U2PU0Iepf\n" +
    "kPsZoSATLD4M//UT9RzA10EKR6QeI4dlGxwJKgX0OlLtUssohp/CQ0MCqEMcm0Ow\n" +
    "BLyAVqFwxQdMyuAbWdjrgNHBhauWTFpiYjvuLOoRgAFjEXJDx0wpZBjZg5MW+Y8g\n" +
    "mVGGzcLJxsFCLAXl/U7akayrl0+V2QRnF2PktfXWZUetEkuu3xcezMQZcY/R2wnW\n" +
    "BE3PdgTQWezhZmaY8pB93BVwANmnMlQx+7b429bXScP3gkivz73rIaH9egeY1LlK\n" +
    "sgjTK7g2/7IICBTgjTI3rkLmAxn7tGomBk/Z2wIDAQABAoIBACBtteOcIqMzhP1v\n" +
    "dtTUb2SnCGVRIhekgZg+FjcOTKocz4dtWrmV/FIXwoZpFvWcntiqwWP7X+PKseR6\n" +
    "sSmiLorZNVTz/UlbgsxmLzLhnpHUD/8cAOHMxH7/BJOJjHGAS+4VpyEbpKbFlYgd\n" +
    "5FbTZfdPA7F5/LCDA88A1wzdskJJ9ufb50XnExL4FyCKPBhuPCM3/8h6va71tbbk\n" +
    "adNo4OAe+fldxCiT6y4h8Rqe3TxCJj84PlAqDAqpGsMTgyQKCF03TRrB5njdVUIO\n" +
    "5jZ0J/CN5Q12MtKJ/QIbcp+ZDxXYMSc+qAiIRXkw8dsKsKu3LO7aIMsLo/7GgoMc\n" +
    "B8ypzlkCgYEA/p5mSVGQrQIthNbt2+JLRxWRbZXuOoU795ntsXXiFY4Ye+n+eMDc\n" +
    "2ym3599j8DTKEJX7urfnJ14BjiwWDnXXKdmb808TbmVQUEaTsPuthgdcK0s4b1nh\n" +
    "IfOXuwXth137PcxE1QBZ5xFNsKR/6FbKUMlVJjQS/1dw5xpOSqMxzBUCgYEA+sTE\n" +
    "lQKknFM5ZMOPmj4+Etv1dOaEe6emqRLzeh7EWMjfLuiIGXqewOZWy5hiPQhGam7k\n" +
    "D1Qzk5zrobYysLQjQ/pKfF5ZqoTMqcTXTHlARBdUrcGUU3g0nTWTIiqtFIgLyOsy\n" +
    "xsaN54XPDHhxEsquvKYtxos1bYXhdp11FrO8Wi8CgYEAyRvrxrV6BGzX7zikHy0a\n" +
    "MEdE2r21sNtThjo6mBR4QnY9uIIV0OLkjubgr3CuyyenAnq0ncJr/ZguulDwCvPg\n" +
    "wtlyaDdpLaUwTnewZ/YiFN7zWe7L4IepXtu8WKhR+L2umB0jsOnaGLx+FKuZq7YB\n" +
    "jtW3P7mZ170FHESW2jUUPBECgYEA31B/J5u076mFgOBOb7NiH/VVfwcRj/Tai9Je\n" +
    "lK/1doNbjTBykw4Jdgsp3CEVyvgljP63hZccXyXtCJNyTL3+cbjgwCRdgWbFw6GR\n" +
    "gX6w5nJIbHvpFPQFFsLxBgovHAuTQxeAnlePY1Bb8+UF/RAVz9XFCfxKVgBVqgXK\n" +
    "ka752u0CgYEAgXyYTgVIy2mWMBcxlpvET1GnR5h4p91ozTghHLkIhCW6Lwpq1e0v\n" +
    "xlvfsm1CQZwjPDMQGnYsBDI7Ll33KMKd7P40t7Nmrncl/dvtNSmK/MSj4/fgvwAc\n" +
    "lpcDMMF0caxnG/KhxMua/0Dz5Xy+ZjvhBmmYEwjAGN18qf5oDsyATTI=\n" +
    "-----END RSA PRIVATE KEY-----\n";

const rootCertPem = "-----BEGIN CERTIFICATE-----\n" +
    "MIIDQDCCAiigAwIBAgIAMA0GCSqGSIb3DQEBBQUAMGQxFDASBgNVBAMTC2V4YW1w\n" +
    "bGUub3JnMQswCQYDVQQGEwJaSDESMBAGA1UECBMJU2hlblpoZW5nMQ0wCwYDVQQH\n" +
    "EwRUZXN0MQ0wCwYDVQQKEwRUZXN0MQ0wCwYDVQQLEwRUZXN0MB4XDTE5MTIwODA3\n" +
    "Mzk0MFoXDTIwMTIwODA3Mzk0MFowZDEUMBIGA1UEAxMLZXhhbXBsZS5vcmcxCzAJ\n" +
    "BgNVBAYTAlpIMRIwEAYDVQQIEwlTaGVuWmhlbmcxDTALBgNVBAcTBFRlc3QxDTAL\n" +
    "BgNVBAoTBFRlc3QxDTALBgNVBAsTBFRlc3QwggEiMA0GCSqGSIb3DQEBAQUAA4IB\n" +
    "DwAwggEKAoIBAQD5amSvZOxcmTopp2FCZ2qJXw8P8FwTi9RHfmgLbpTY9TQh6l+Q\n" +
    "+xmhIBMsPgz/9RP1HMDXQQpHpB4jh2UbHAkqBfQ6Uu1SyyiGn8JDQwKoQxybQ7AE\n" +
    "vIBWoXDFB0zK4BtZ2OuA0cGFq5ZMWmJiO+4s6hGAAWMRckPHTClkGNmDkxb5jyCZ\n" +
    "UYbNwsnGwUIsBeX9TtqRrKuXT5XZBGcXY+S19dZlR60SS67fFx7MxBlxj9HbCdYE\n" +
    "Tc92BNBZ7OFmZpjykH3cFXAA2acyVDH7tvjb1tdJw/eCSK/Pveshof16B5jUuUqy\n" +
    "CNMruDb/sggIFOCNMjeuQuYDGfu0aiYGT9nbAgMBAAEwDQYJKoZIhvcNAQEFBQAD\n" +
    "ggEBAIrJ48liEaQY/qnaPpZ6eqZMWneyeLBUDJzcGX/ui96PQptbEwYUS5XYmfqJ\n" +
    "cF10h8oWOWb0lLSFFl+Q1xB/JQB9eiFlY7GNTz8twmnx88Ol85oVYLHdk/SXdCYK\n" +
    "STjP1gXuqT0Yxbs/HD4mg0AJ57uQWLEvpL+nXQ8644dCZqDz+OeZd4cLcBW5CJd5\n" +
    "eOJD1bmvYv6jaDw6hv1hIIwAZTG7CKlxOjARYUbE/pzHXmiJqLutmddF2e2JRhAv\n" +
    "XA5Sgg2ka1kRIygQeADi5ZO+diCvoVpEBRjIxCJ93DkHRw8+RT+dHb1txutfWYB3\n" +
    "VxcMmejk+SV3YdaziavCccHNKVE=\n" +
    "-----END CERTIFICATE-----\n";

/**
 * 生成公私钥对和证书
 * @returns {{rootPrivateKeyPem: *, cert: *, publicKey: *}}
 */
function generateKeysAndCertification(self = false) {
    const pki = forge.pki;
    const keys = pki.rsa.generateKeyPair(2048);
    const cert = pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = 1;      // 标号
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
    const attrs = [{
        name: 'commonName',
        value: 'example.org'
    }, {
        name: 'countryName',
        value: 'ZH'
    }, {
        shortName: 'ST',
        value: 'ShenZheng'
    }, {
        name: 'localityName',
        value: 'Test'
    }, {
        name: 'organizationName',
        value: 'Test'
    }, {
        shortName: 'OU',
        value: 'Test'
    }];
    cert.setSubject(attrs);
    cert.setIssuer(attrs);

    // 是否是自签证书
    if (self) {
        // 用CA的根证书给证书签名
        cert.sign(pki.privateKeyFromPem(rootPrivateKeyPem));
    } else {
        // 用CA的根证书给证书签名
        const caRootPrivateKey = pki.privateKeyFromPem(rootPrivateKeyPem);
        cert.sign(caRootPrivateKey);
    }

    return {
        privateKey: keys.privateKey,
        publicKey: keys.publicKey,
        cert: cert
    };
}

/**
 * 验证证书是否有效
 * @param cert
 * @returns {*}
 */
function verifyCert(cert) {
    const pki = forge.pki;
    const rootCert = pki.certificateFromPem(rootCertPem);
    return rootCert.verify(cert);
}

module.exports = {
    rootPublicKeyPem,
    generateKeysAndCertification,
    rootCertPem,
    verifyCert
};
