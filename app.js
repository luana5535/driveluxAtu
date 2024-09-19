const express = require('express')
const mongoose = require('mongoose')
const app = express()
app.use(express.json())
const port = 3000

mongoose.connect("mongodb://localhost:27017/drivelux")
.then(() => console.log('conectado ao MongoDB'))
.catch((erro) => console.log('erro ao conectar MongoDB', erro))

app.listen(port, () => {
    console.log(`iniciando na porta http//localhost:${port}`)
})

const schemaCarro = new mongoose.Schema({
    marca: {type: String, required: true},
    modelo: {type: String, required: true},
    ano: {type: Number, required: true},
    placa: {type: String, required: true},
    vendido: {type: Boolean, default: false},
    comprador: {type: String, default: null}
})
const Carro= mongoose.model('Carro', schemaCarro)

async function criarCarro(marca, modelo, ano, placa){
    try{
    const newCarro = new Carro({marca, modelo, ano, placa})
    return await newCarro.save()
    }catch(erro){
        console.error('erro ao cadastrar carro', erro)
        throw erro
    }
}

app.post('/carros', async(req, res)=> {
    try{
        const {marca, modelo, ano, placa}= req.body
        const newCarro = await criarCarro(marca, modelo, ano, placa)
        res.status(200).json({mensagem: 'carro cadastrado com sucesso', carro: newCarro})
    }catch(erro){
        res.status(500).json({mensagem: 'erro ao cadastrar carro', erro: erro.message})
    }
})

async function listarCarros(){
    try{
        return await Carro.find()
    }catch(erro){
        console.error('erro ao listar', erro)
        throw erro
    }
}

app.get('/carros', async (req, res)=> {
    try{
        const carros= await listarCarros()
        res.status(200).json(carros)
    }catch(erro){
        res.status(500).json({mensagem:'erro ao listar', erro: erro.message})
    }
})

async function editarCarros(id, marca, modelo, ano, placa){
    try{
        const carroAtualizado= await Carro.findByIdAndUpdate(
            id,
            {marca, modelo, ano, placa},
            {new: true, runValidators: true}
        )
        return carroAtualizado
    }catch(erro){
        console.error('erro ao editar carro', erro)
        throw erro
    }
}

app.put('/carros/:id', async (req, res)=> {
    try{
        const{id}= req.params
        const {marca, modelo, ano, placa}= req.body
        const carroAtualizado= await editarCarros(
            id,
            marca,
            modelo,
            ano,
            placa
        )
        if(carroAtualizado){
            res.status(200).json({mensagem:'editado com sucesso', carro: carroAtualizado})
        }else{
            res.status(404).json({mensagem:'carro não encontrado'})
        }
    }catch(erro){
        res.status(500).json({mensagem: 'erro ao editar carro', erro: erro.message})
    }
})

async function deletarCarro(id){
    try{
        const carroDeletado = await Carro.findByIdAndDelete(id)
        return carroDeletado
    }catch(erro){
        console.error('erro ao deletar carro', erro)
        throw erro
    }
}

app.delete('/carros/:id', async (req, res)=> {
    try{
        const {id}= req.params
        const carroDeletado= await deletarCarro(id)
        if(carroDeletado){
            res.status(200).json({mensagem: "deletado com sucesso", carro: carroDeletado})
        }else{
            res.status(404).json({mensagem: 'carro não encontrado'})
        }
    }catch(erro){
        res.status(500).json({mensagem: 'erro ao deletar', erro: erro.message})
    }
})

app.patch('/carros/:id', async (req, res) => {
    try{
        const {id}= req.params
        const {comprador}= req.body
        
        const carroAtualizado= await Carro.findByIdAndUpdate(
            id,
            {vendido: true, comprador},
            { new: true, runValidators: true }
        )
        if(carroAtualizado){
            res.status(200).json({ mensagem: 'carro marcado como vendido', carro: carroAtualizado })
        }else{
            res.status(404).json({ mensagem: 'carro não encontrado' })
        }
    }catch(erro){
        res.status(500).json({ mensagem: 'erro ao marcar carro como vendido', erro: erro.message })
    }
})