export const series = async (promises, output = [], counter = 0) => {
  if (counter === promises.length) {
    return output
  }
  output.push(await promises[counter]())

  return series(promises, output, ++counter)
}
