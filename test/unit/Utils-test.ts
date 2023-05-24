import assert from "assert";
import Utils from "../../src/Utils";

describe('Util', function () {
  it('getRad', function () {
    assert.equal(Utils.getRad(90), 1.5707963267948966)
  })
})