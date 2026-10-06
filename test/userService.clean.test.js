const { UserService } = require('../src/userService');

const dadosUsuarioPadrao = {
  nome: 'Fulano de Tal',
  email: 'fulano@teste.com',
  idade: 25,
};

describe('UserService - Suíte de Testes Limpa', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  const criarUsuarioPadrao = () =>
    userService.createUser(
      dadosUsuarioPadrao.nome,
      dadosUsuarioPadrao.email,
      dadosUsuarioPadrao.idade
    );

  describe('createUser', () => {
    test('deve gerar um id ao criar um usuário válido', () => {
      // Arrange + Act
      const usuarioCriado = criarUsuarioPadrao();

      // Assert
      expect(usuarioCriado.id).toBeDefined();
    });

    test('deve criar o usuário com status "ativo" por padrão', () => {
      // Arrange + Act
      const usuarioCriado = criarUsuarioPadrao();

      // Assert
      expect(usuarioCriado.status).toBe('ativo');
    });

    test('deve lançar erro ao criar usuário menor de idade', () => {
      // Arrange
      const criarMenor = () =>
        userService.createUser('Menor', 'menor@email.com', 17);

      // Act + Assert
      expect(criarMenor).toThrow('O usuário deve ser maior de idade.');
    });

    test.each([
      ['nome', ['', 'a@teste.com', 30]],
      ['email', ['Fulano', '', 30]],
      ['idade', ['Fulano', 'a@teste.com', 0]],
    ])('deve lançar erro quando o campo %s não é informado', (_campo, args) => {
      // Arrange
      const criarInvalido = () => userService.createUser(...args);

      // Act + Assert
      expect(criarInvalido).toThrow('Nome, email e idade são obrigatórios.');
    });
  });

  describe('getUserById', () => {
    test('deve retornar o usuário criado ao buscar pelo seu id', () => {
      // Arrange
      const usuarioCriado = criarUsuarioPadrao();

      // Act
      const usuarioBuscado = userService.getUserById(usuarioCriado.id);

      // Assert
      expect(usuarioBuscado.nome).toBe(dadosUsuarioPadrao.nome);
    });

    test('deve retornar null quando o id não existe', () => {
      // Arrange
      const idInexistente = 'id-que-nao-existe';

      // Act
      const resultado = userService.getUserById(idInexistente);

      // Assert
      expect(resultado).toBeNull();
    });
  });

  describe('deactivateUser', () => {
    test('deve retornar true ao desativar um usuário comum', () => {
      // Arrange
      const usuarioComum = userService.createUser('Comum', 'comum@teste.com', 30);

      // Act
      const resultado = userService.deactivateUser(usuarioComum.id);

      // Assert
      expect(resultado).toBe(true);
    });

    test('deve alterar o status para "inativo" ao desativar um usuário comum', () => {
      // Arrange
      const usuarioComum = userService.createUser('Comum', 'comum@teste.com', 30);

      // Act
      userService.deactivateUser(usuarioComum.id);

      // Assert
      expect(userService.getUserById(usuarioComum.id).status).toBe('inativo');
    });

    test('deve retornar false ao tentar desativar um administrador', () => {
      // Arrange
      const usuarioAdmin = userService.createUser('Admin', 'admin@teste.com', 40, true);

      // Act
      const resultado = userService.deactivateUser(usuarioAdmin.id);

      // Assert
      expect(resultado).toBe(false);
    });

    test('deve manter o administrador "ativo" após tentativa de desativação', () => {
      // Arrange
      const usuarioAdmin = userService.createUser('Admin', 'admin@teste.com', 40, true);

      // Act
      userService.deactivateUser(usuarioAdmin.id);

      // Assert
      expect(userService.getUserById(usuarioAdmin.id).status).toBe('ativo');
    });

    test('deve retornar false ao desativar um usuário inexistente', () => {
      // Arrange
      const idInexistente = 'id-que-nao-existe';

      // Act
      const resultado = userService.deactivateUser(idInexistente);

      // Assert
      expect(resultado).toBe(false);
    });
  });

  describe('generateUserReport', () => {
    test('deve incluir o nome e o status de cada usuário no relatório', () => {
      // Arrange
      userService.createUser('Alice', 'alice@email.com', 28);
      userService.createUser('Bob', 'bob@email.com', 32);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toEqual(expect.stringMatching(/Nome: Alice.*Status: ativo/));
      expect(relatorio).toEqual(expect.stringMatching(/Nome: Bob.*Status: ativo/));
    });

    test('deve incluir o id do usuário no relatório', () => {
      // Arrange
      const alice = userService.createUser('Alice', 'alice@email.com', 28);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain(alice.id);
    });

    test('deve exibir mensagem de lista vazia quando não há usuários', () => {
      // Arrange (nenhum usuário criado)

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain('Nenhum usuário cadastrado.');
    });
  });
});
