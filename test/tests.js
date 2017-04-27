const PocHocrCV = require('../poc-hocrCV')
const assert = require('chai').assert
const exec = require('child_process').exec
const expect = require('chai').expect
const fs = require('fs');




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
  it("devrait renvoyer une erreur avec de mauvais parametres", (done) => {
    const config = {
      output: 'test/output/test1.png',
      hocr: 'test/hocr/test1.hocr'
    }
    let test = false;
    try {
      const poc = new PocHocrCV(config)
    } catch (err) {
      test = true
    }
    assert.isOk(test, 'Ne devrait pas instancier la classe')
    done()
  })



  describe('ocr', () => {
    it("devrait instancier la classe avec de bons parametres", (done) => {
      const config = {
        input: 'test/images/test1.png',
        output: 'test/output/test1.png',
        hocr: 'test/hocr/test1.hocr'
      }
      let test = false;
      try {
        const poc = new PocHocrCV(config)
      } catch (err) {
        test = true
      }
      assert.isOk(!test, 'devrait instancier la classe avec de bons parametres')
      done()
    })

    it("devrait creer un hocr quand il n'y en a pas", (done) => {
      let test = false
      if (fs.existsSync("test/hocr/test1.hocr")) !test
      assert.isOk(!test, "pas d'hocr")
      done()
    })
  })




  describe('ocr', () => {
    const config = {
      input: 'test/images/test1.png',
      output: 'test/output/test1.png',
      hocr: 'test/hocr/test1.hocr'
    }
    const poc = new PocHocrCV(config)
    it("devrait instancier la classe avec de bons parametres", (done) => {

      assert.isOk(!test, 'devrait instancier la classe avec de bons parametres')
      done()
    })
  })
})
