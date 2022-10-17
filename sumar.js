
process.on("message", (msg) => {
   
  const resultados = Aleatorios(msg)

  process.send(resultados)
})

const Aleatorios =(msg)=>{
  new Array()
  let miarray = Array.from({length: msg }, () => Math.floor(Math.random() * 1000));
  return miarray
} 