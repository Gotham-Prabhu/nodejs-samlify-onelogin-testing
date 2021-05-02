// This is /routes/sso.js
const samlify = require('samlify');
const validator = require('@authenio/samlify-node-xmllint');
const express = require('express');
const router = express.Router();
var bodyParser = require('body-parser')
const fs = require('fs');
const ServiceProvider = samlify.ServiceProvider;
const IdentityProvider = samlify.IdentityProvider;

samlify.setSchemaValidator(validator);

router.use(bodyParser.urlencoded({ extended: false }));

// Configure your endpoint for IdP-initiated / SP-initiated SSO
const sp = ServiceProvider({
  metadata: fs.readFileSync('./metadata/metadata_sp.xml')
});
const idp = IdentityProvider({
  metadata: fs.readFileSync('./metadata/onelogin_metadata_487043.xml')
});

// Release the sp-metadata publicly
router.get('/metadata', (req, res) => res.header('Content-Type', 'text/xml').send(sp.getMetadata()));
// Release the idp-metadata publicly
router.get('/idp-metadata', (req, res) => res.header('Content-Type', 'text/xml').send(idp.getMetadata()));

// Access URL for implementing SP-init SSO
router.get('/spinitsso-redirect', (req, res) => {
  const { id, context } = sp.createLoginRequest(idp, 'redirect');
  return res.redirect(context);
});

// If your application only supports IdP-initiated SSO, just make this route is enough
// This is the assertion service url where SAML Response is sent to
router.post('/acs', (req, res) => {
  sp.parseLoginResponse(idp, 'post', req)
    .then(parseResult => {
      console.log(parseResult.samlContent);
      console.log(parseResult.extract);
      var currentDate = new Date();
      console.log(parseResult.extract.conditions.notBefore);
      console.log(parseResult.extract.conditions.notOnOrAfter);
      var notBeforeDate = new Date(parseResult.extract.conditions.notBefore);
      var notAfterDate = new Date(parseResult.extract.conditions.notOnOrAfter);
      if (currentDate > notBeforeDate && currentDate < notAfterDate) {
        console.log("Yayyy");
        res.redirect("https://www.mozilla.org/en-US/");
      }
      else {
        console.log("Nayyy");
        if (currentDate < notBeforeDate){
          throw new Error('Current Date is before the Min SAML Date');
        } else if (currentDate > notAfterDate){
          throw new Error('Current Date is after the Max SAML Date');
        }
      }
      // ...
    })
    .catch(console.error);
});

module.exports = router