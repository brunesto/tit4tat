var assert = require('assert');
const fse = require('fs-extra');
const tit4tat = require('../tit4tat.js');

function cleanup() {
    fse.removeSync("./test/tmp")
}
const PAYLOAD = "The quick brown fox jumps over the lazy dog"
const MODIFIED="The quick brown dog jumps over the lazy dog"
const MODIFIED_BWD="The quick brown fox jumps over the lazy fox"

function setup() {
    //console.log('setup starts')
    cleanup()
    fse.mkdirsSync("./test/tmp/in")
        // fse.copySync("./test/fixture", "./test/tmp/fixture",{overwrite:true}, (err) => {
        //     if (err) return console.error("err:"+err)
        //     console.log('success!')
        // })

    fse.writeFileSync("./test/tmp/in/foo.txt", PAYLOAD);
   // console.log('setup done')
}

describe('tit4tat tests', () => {

    const defaultOptions = {
        src: './test/tmp/in',
        out: './test/tmp/out',
        rules: [{ s: 'fox', f: 'dog' }]

    }

    it('does not modify source', () => {
        setup()
        tit4tat.tit4tat({...defaultOptions })

        const srcAfter = ""+fse.readFileSync("./test/tmp/in/foo.txt");
        assert.equal(PAYLOAD , srcAfter, 'source modified')
    })

    it('applies rule', () => {
        setup()
        tit4tat.tit4tat({...defaultOptions })
            // check that the dest is modified accordingly
        const dest = ""+fse.readFileSync("./test/tmp/out/foo.txt");
        assert.equal(dest ,MODIFIED )
    });


    it('applies rule bwd', () => {
      setup()
      tit4tat.tit4tat({...defaultOptions ,order:'bwd'})
          // check that the dest is modified accordingly
      const dest = ""+fse.readFileSync("./test/tmp/out/foo.txt");
      assert.equal(dest,MODIFIED_BWD )
  });



    it('exludes file not in filter', () => {
        setup()
        tit4tat.tit4tat({...defaultOptions,
            filters: ['**/*.js']
        })

        const dest = ""+fse.readFileSync("./test/tmp/out/foo.txt");
        assert.equal(dest , PAYLOAD)
    });

    it('modify file inplace', () => {
      setup()
      tit4tat.tit4tat({...defaultOptions,
          inplace:true,
      })

      const src =""+ fse.readFileSync("./test/tmp/in/foo.txt");
      assert.equal(src,MODIFIED)
  });

});