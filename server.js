const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const upload = multer({ dest: 'uploads/' }); // Pasta temporária para arquivos anexados

// Configuração do Nodemailer
const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'senaisecretaria04@gmail.com', // Substitua com seu e-mail
        pass: 'pihfhugboeukcauv',           // Substitua com sua senha (ou app password)
    }
});

// Endpoint para receber os dados do formulário e anexos
app.post('/send-email', upload.array('attachments'), async (req, res) => {
    const { nome, email, cpf, cep, rua, bairro, uf } = req.body;

    // Verificar arquivos anexados
    console.log('Arquivos recebidos:', req.files);

    // Processar os anexos para o e-mail
    const attachments = req.files.map(file => ({
        filename: file.originalname,
        path: path.resolve(file.path), // Garante o caminho absoluto do arquivo
    }));

    try {
        // Enviar o e-mail com os dados do formulário e anexos
        await transport.sendMail({
            from: `"${nome}" <${email}>`,
            to: 'senaisecretaria04@gmail.com', // Seu e-mail para receber a mensagem
            subject: 'Dados do formulário com anexos',
            html: `
                <h1>Informações do formulário</h1>
                <p><strong>Nome:</strong> ${nome}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>CPF:</strong> ${cpf}</p>
                <p><strong>CEP:</strong> ${cep}</p>
                <p><strong>Rua:</strong> ${rua}</p>
                <p><strong>Bairro:</strong> ${bairro}</p>
                <p><strong>UF:</strong> ${uf}</p>
            `,
            attachments: attachments,
        });

        // Remover arquivos temporários após envio
        attachments.forEach(file => fs.unlinkSync(file.path));

        res.status(200).send('Email enviado com sucesso');
    } catch (error) {
        console.error('Erro ao enviar o email:', error);
        res.status(500).send('Erro ao enviar o email');
    }
});

// Iniciar o servidor na porta 3000
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
