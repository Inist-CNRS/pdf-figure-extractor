const PocHocrCV = require('../poc-hocrCV')
const assert = require('chai').assert
const exec = require('child_process').exec
const expect = require('chai').expect
const fs = require('fs');


const goodConfig = {
  imageInputPath: 'test/images/test1.png',
  imageOutputPath: 'test/output/test1.png',
  hocrPath: 'test/hocr/test1.hocr'
}


const badConfig = {
  imageOutputPath: 'test/output/test1.png',
  hocrPath: 'test/hocr/test1.hocr'
}

describe('Dependances', () => {
  it('devrait avoir accès à la commande tesseract sur cette machine', (done) => {
    exec('which tesseract', (err, stdout, stderr) => {
      void expect(err, 'la commande which devrait exister').to.be.null;
      void expect(stderr, 'la commande which ne doit pas retourner d`erreur').to.be.empty;
      void expect(stdout, "tesseract introuvable").to.be.not.null;
      done()
    })
  })
})



describe('Initialisation', () => {
  it("devrait renvoyer une erreur avec un parametre manquant", (done) => {
    PocHocrCV.init(badConfig).then(_ => {
      assert.isOk(false, 'devrait soulever une erreur')
      done()
    }).catch(err => {
      assert.isOk(true, 'devrait soulever une erreur')
      done()
    })
  })

  it("ne devrait pas renvoyer une erreur avec de bons parametres", (done) => {
    PocHocrCV.init(goodConfig).then(_ => {
      assert.isOk(true, 'ne devrait pas instancier la classe')
      done()
    }).catch(err => {
      console.error('error', err);
      assert.isOk(false, 'ne devrait pas soulever une erreur')
      done()
    })
  })

  it("devrait lancer l'ocerisation", (done) => {
    assert.isOk(fs.existsSync("test/hocr/test1.hocr"), "pas d'hocr")
    done()
  })

})
