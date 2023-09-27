import { test } from '../../test-utils/unit/test.util.js'
import { gexp, glog  } from './qr-math.util.js'

test('gexp simple tests', ({ expect }) => {
  expect([1,2,3,4,5,6,7,8, 0, 256, -1].map(gexp)).toEqual([2,4,8,16,32,64,128,29, 1, 2, 142])
})


test('glog simple tests', ({ expect }) => {
  expect([1,2,3,4,5,6,7,8].map(glog)).toEqual([0,1,25,2,50,26,198,3])
  try {
    glog(-1)
    throw Error("not the correct error")
  } catch (e) {
    expect(e.message).toEqual("glog(-1)")
  }

  expect([256, 1000].map(glog)).toEqual([undefined, undefined])

})
