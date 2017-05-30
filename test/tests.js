
const assert = require('chai').assert
const exec = require('child_process').exec
const expect = require('chai').expect
const fs = require('fs');
const pfe = require('../index.js')
const Promise = require('bluebird')
const path = require('path')


const goodConfig = {
  pdfInputPath: path.join(__dirname, './pdf'),
  directoryOutputPath: path.join(__dirname, './tmp/images'),
  directoryPartialPath: path.join(__dirname, './tmp/images'),
  tmp: path.join(__dirname, "./tmp"),
  debug:true
}
const badConfig = {
  pdfInputPath: path.join(__dirname, './pdf'),
  directoryOutputPath: path.join(__dirname, './tmp/images'),
  directoryPartialPath: path.join(__dirname, './tmp/images'),
  tmp: path.join(__dirname, "./tmp"),
  debug:true
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
  it('devrait avoir accès à la commande ghostscript sur cette machine', (done) => {
    exec('which ghostscript', (err, stdout, stderr) => {
      void expect(err, 'la commande which devrait exister').to.be.null;
      void expect(stderr, 'la commande which ne doit pas retourner d`erreur').to.be.empty;
      void expect(stdout, "ghostscript introuvable").to.be.not.null;
      done()
    })
  })
  it('devrait avoir accès à opencv sur cette machine', (done) => {
    const exist = fs.existsSync('/usr/local/include/opencv')
    void expect(exist, "opencv introuvable").to.be.true;
    done();
  })
})




describe('Initialisation', () => {
  it("devrait renvoyer une erreur avec un parametre manquant", (done) => {
    new pfe(badConfig).then(_ => {
      assert.isOk(false, 'devrait soulever une erreur')
      done()
    }).catch(err => {
      assert.isOk(true, 'devrait soulever une erreur')
      done()
    })
  })

  it("ne devrait pas renvoyer une erreur avec de bons parametres", (done) => {
    new pfe(goodConfig).then(_ => {
      assert.isOk(true, 'ne devrait pas instancier la classe')
      done()
    }).catch(err => {
      console.log("lekjzefklzef")
      console.error('error', err);
      assert.isOk(false, 'ne devrait pas soulever une erreur')
      done()
    })
  })

  it("devrait lancer l'ocerisation", (done) => {
    new pfe(goodConfig).then(self=>{
      return self.exec()
    }).then(partials=>{
      console.log(partials)
      assert.isOk(false, 'devrait contenir des partials')
      done()
    }).catch(err=>{
      assert.isOk(false, 'devrait lancer la detection')
      done()
    })
  })

})
