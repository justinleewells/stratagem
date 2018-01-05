class Enum {
  init(arr) {
    for (let i = 0; i < arr.length; i++) {
      this[arr[i]] = i
    }
  }
}
module.exports = Enum
