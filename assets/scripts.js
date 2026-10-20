
const formularioPin = document.querySelector('#formulario-pin');
const inputFile = document.querySelector('#arquivos');

const uploadVazio = document.querySelector('#upload-vazio');
const uploadPreview = document.querySelector('#upload-preview');
const imagemUpload = document.querySelector('#imagem-upload');

const uploadErro = document.querySelector('#upload-erro');
const mensagemErro = document.querySelector('#mensagem-erro');
const areaUpload = document.querySelector('.area-upload');

const placeholder = document.querySelector('#rascunho-placeholder');
const rascunhoCard = document.querySelector('#rascunho-card');
const imagemRascunho = document.querySelector('#imagem-rascunho');
const btnExcluir = document.querySelector('#excluir-rascunho');

const pinPublicado = document.querySelector('#pin-publicado');
const pinLink = document.querySelector('#pin-link');
const pinImagem = document.querySelector('#pin-imagem');
const pinImagemSemLink = document.querySelector('#pin-imagem-sem-link');
const pinTitulo = document.querySelector('#pin-titulo');
const pinDescricao = document.querySelector('#pin-descricao');
const pinTopicos = document.querySelector('#pin-topicos');

const cabecalho = document.querySelector('#cabecalho');
const abaRascunhos = document.querySelector('#aba-rascunhos');

const progressoPublicacao = document.querySelector('#progresso-publicacao');
const estadoPublicando = document.querySelector('#estado-publicando');
const estadoPublicado = document.querySelector('#estado-publicado');
const barraProgresso = document.querySelector('#barra-progresso');
const barraProgressoContainer = document.querySelector('#barra-progresso-container');
const porcentagemPublicacao = document.querySelector('#porcentagem-publicacao');

const iconePublicando = document.querySelector('#icone-publicando');
const iconePublicado = document.querySelector('#icone-publicado');
const textoRascunho = document.querySelector('#texto-rascunho');

const btnPublicar = formularioPin.querySelector('button[type="submit"]');
const btnVoltarFormulario = document.querySelector('#voltar-formulario');

const carregandoPin = document.querySelector('#carregando-pin');
const conteudoPrincipal = document.querySelector('.conteudo-principal');

const progressoMobile = document.querySelector('#progresso-mobile');
const barraProgressoMobile = document.querySelector('#barra-progresso-mobile');
const porcentagemMobile = document.querySelector('#porcentagem-mobile');
const textoProgressoMobile = document.querySelector('#texto-progresso-mobile');

const campos = formularioPin.querySelectorAll(
    '#titulo, #descricao, #link, #topicos'
);

let urlTemporaria = null;
let intervaloPublicacao = null;
let timeoutPublicacao = null;


// Habilita ou desabilita os campos do formulário
function definirCamposDesabilitados(desabilitados) {
    campos.forEach((campo) => {
        campo.disabled = desabilitados;

        if (desabilitados) {
            campo.parentElement.classList.add('bg-cinza');
        } else {
            campo.parentElement.classList.remove('bg-cinza');
        }
    });
}


// Libera a URL temporária da imagem
function liberarUrlTemporaria() {
    if (urlTemporaria) {
        URL.revokeObjectURL(urlTemporaria);
        urlTemporaria = null;
    }
}


// Restaura a interface do upload após um erro
function mostrarErroUpload(mensagem) {
    liberarUrlTemporaria();

    imagemUpload.removeAttribute('src');
    imagemRascunho.removeAttribute('src');

    uploadVazio.classList.add('d-none');
    uploadPreview.classList.add('d-none');
    uploadErro.classList.remove('d-none');

    placeholder.classList.remove('d-none');
    rascunhoCard.classList.add('d-none');

    areaUpload.classList.add('upload-invalido');
    mensagemErro.textContent = mensagem;

    definirCamposDesabilitados(true);
}


// Reseta o estado visual da publicação
function resetarProgressoPublicacao() {
    if (intervaloPublicacao !== null) {
        clearInterval(intervaloPublicacao);
        intervaloPublicacao = null;
    }

    if (timeoutPublicacao !== null) {
        clearTimeout(timeoutPublicacao);
        timeoutPublicacao = null;
    }

    progressoPublicacao.classList.add('d-none');
    estadoPublicando.classList.remove('d-none');
    estadoPublicado.classList.add('d-none');

    iconePublicando.classList.add('d-none');
    iconePublicado.classList.add('d-none');

    textoRascunho.classList.remove('d-none');

    barraProgresso.style.width = '0%';
    barraProgresso.setAttribute('aria-valuenow', '0');
    porcentagemPublicacao.textContent = '0%';

    btnPublicar.disabled = false;
}


// Remove a imagem e restaura a interface inicial
function limparImagem() {
    resetarProgressoPublicacao();
    liberarUrlTemporaria();

    inputFile.value = '';

    imagemUpload.removeAttribute('src');
    imagemRascunho.removeAttribute('src');

    uploadVazio.classList.remove('d-none');
    uploadPreview.classList.add('d-none');

    placeholder.classList.remove('d-none');
    rascunhoCard.classList.add('d-none');

    uploadErro.classList.add('d-none');
    areaUpload.classList.remove('upload-invalido');
    mensagemErro.textContent = '';

    definirCamposDesabilitados(true);
}


// Quando o usuário seleciona um arquivo
inputFile.addEventListener('change', (e) => {
    const arquivo = e.target.files[0];

    if (!arquivo) return;

    // Aceita somente os formatos definidos no atributo accept
    const formatosPermitidos = inputFile
        .getAttribute('accept')
        .split(',')
        .map(formato => formato.trim());

    if (!formatosPermitidos.includes(arquivo.type)) {
        mostrarErroUpload(
            'Formato inválido. Selecione uma imagem JPG, PNG ou WebP.'
        );
        return;
    }

    // Limite de 20 MB
    const tamanhoMaximo = 20 * 1024 * 1024;

    if (arquivo.size > tamanhoMaximo) {
        mostrarErroUpload(
            'Imagem muito grande. O tamanho máximo permitido é 20 MB.'
        );
        return;
    }

    // Verifica as dimensões da imagem
    const urlVerificacao = URL.createObjectURL(arquivo);
    const imagem = new Image();

    imagem.onload = () => {
        const largura = imagem.naturalWidth;
        const altura = imagem.naturalHeight;

        URL.revokeObjectURL(urlVerificacao);

        if (largura < 200 || altura < 300) {
            mostrarErroUpload(
                `Dimensões insuficientes: ${largura} × ${altura} px. ` +
                'A imagem deve ter pelo menos 200 × 300 px.'
            );
            return;
        }

        // Limpa qualquer progresso anterior
        resetarProgressoPublicacao();

        liberarUrlTemporaria();
        urlTemporaria = URL.createObjectURL(arquivo);

        areaUpload.classList.remove('upload-invalido');
        uploadErro.classList.add('d-none');
        mensagemErro.textContent = '';

        imagemUpload.src = urlTemporaria;
        imagemRascunho.src = urlTemporaria;

        uploadVazio.classList.add('d-none');
        uploadPreview.classList.remove('d-none');

        placeholder.classList.add('d-none');
        rascunhoCard.classList.remove('d-none');

        definirCamposDesabilitados(false);
    };

    imagem.onerror = () => {
        URL.revokeObjectURL(urlVerificacao);
        mostrarErroUpload('Não foi possível ler a imagem selecionada.');
    };

    imagem.src = urlVerificacao;
});


// Exclui a imagem após confirmação
btnExcluir.addEventListener('click', () => {
    const confirmar = confirm(
        'Tem certeza de que deseja excluir esta imagem? ' +
        'Os dados preenchidos no formulário também serão perdidos.'
    );

    if (!confirmar) return;

    formularioPin.reset();
});


// O botão Limpar restaura o estado inicial
formularioPin.addEventListener('reset', () => {
    limparImagem();
});


// Simula a publicação do Pin
formularioPin.addEventListener('submit', (e) => {
    e.preventDefault();

    // Impede publicações duplicadas
    if (
        intervaloPublicacao !== null ||
        timeoutPublicacao !== null
    ) {
        return;
    }

    if (!urlTemporaria || !imagemUpload.src) {
        mostrarErroUpload('Selecione uma imagem válida antes de publicar.');
        return;
    }

    const titulo = document.querySelector('#titulo').value.trim();
    const descricao = document.querySelector('#descricao').value.trim();
    const link = document.querySelector('#link').value.trim();
    const topicos = document.querySelector('#topicos').value.trim();

    // Valida o link antes de começar
    let urlValidada = '';

    if (link) {
        try {
            const url = new URL(link);

            if (!['http:', 'https:'].includes(url.protocol)) {
                throw new Error('Protocolo inválido');
            }

            urlValidada = url.href;
        } catch {
            alert('Informe um link válido começando com http:// ou https://.');
            return;
        }
    }

    // Prepara o Pin que será exibido ao final
    pinTitulo.textContent = titulo || 'Pin sem título';
    pinDescricao.textContent = descricao;
    pinTopicos.textContent = topicos ? `Tópicos: ${topicos}` : '';

    if (urlValidada) {
        pinLink.href = urlValidada;
        pinImagem.src = urlTemporaria;
        pinImagem.alt = titulo || 'Pin publicado';

        pinLink.classList.remove('d-none');
        pinImagemSemLink.classList.add('d-none');
    } else {
        pinImagemSemLink.src = urlTemporaria;
        pinImagemSemLink.alt = titulo || 'Pin publicado';

        pinImagemSemLink.classList.remove('d-none');
        pinLink.classList.add('d-none');
    }

    // 1. Mostra o progresso ao lado da imagem
    progressoPublicacao.classList.remove('d-none');
    textoRascunho.classList.add('d-none');

    estadoPublicando.classList.remove('d-none');
    estadoPublicado.classList.add('d-none');

    // Mostra o progresso no mobile
    progressoMobile.classList.remove('d-none');
    textoProgressoMobile.textContent = 'Publicando Pin...';

    // 2. Mostra o spinner sobre a imagem
    iconePublicando.classList.remove('d-none');
    iconePublicado.classList.add('d-none');

    // Reinicia a barra e a porcentagem
    barraProgresso.style.width = '0%';
    barraProgresso.setAttribute('aria-valuenow', '0');
    porcentagemPublicacao.textContent = '0%';

    btnPublicar.disabled = true;

    let progresso = 0;

    // 3. Simula a publicação durante aproximadamente 3 segundos
    intervaloPublicacao = setInterval(() => {
        progresso = Math.min(progresso + 5, 100);

        barraProgresso.style.width = `${progresso}%`;
        barraProgresso.setAttribute('aria-valuenow', String(progresso));
        porcentagemPublicacao.textContent = `${progresso}%`;

        // Barra principal (mobile)
        barraProgressoMobile.style.width = `${progresso}%`;
        barraProgressoMobile.setAttribute('aria-valuenow', String(progresso));
        porcentagemMobile.textContent = `${progresso}%`;

        if (progresso >= 100) {
            clearInterval(intervaloPublicacao);
            intervaloPublicacao = null;

            // 4. Troca o spinner por um check verde
            iconePublicando.classList.add('d-none');
            iconePublicado.classList.remove('d-none');

            // Troca a mensagem para confirmação
            estadoPublicando.classList.add('d-none');
            estadoPublicado.classList.remove('d-none');

            // Informa que a publicação terminou no mobile
            textoProgressoMobile.textContent = 'Pin publicado!';

            // 5. Aguarda 1,8 segundo e exibe o Pin

            timeoutPublicacao = setTimeout(() => {
                timeoutPublicacao = null;

                // Mostra o spinner de transição
                carregandoPin.classList.remove('d-none');

                // Aguarda um instante para o usuário perceber a transição
                setTimeout(() => {
                    // Oculta a interface de criação
                    formularioPin.classList.add('d-none');
                    progressoMobile.classList.add('d-none');
                    cabecalho.classList.add('d-none');
                    abaRascunhos.classList.add('d-none');

                    // Exibe o Pin publicado
                    pinPublicado.classList.remove('d-none');

                    // Prepara a animação de entrada
                    requestAnimationFrame(() => {
                        pinPublicado.classList.add('pin-visivel');

                        // Retira o spinner após a transição
                        setTimeout(() => {
                            carregandoPin.classList.add('d-none');
                        }, 400);
                    });

                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }, 700);
            }, 1800);

        }
    }, 150);
});


// Volta à tela de criação
btnVoltarFormulario.addEventListener('click', () => {
    limparImagem();

    pinPublicado.classList.add('d-none');

    cabecalho.classList.remove('d-none');
    abaRascunhos.classList.remove('d-none');
    formularioPin.classList.remove('d-none');

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});