package com.healplus.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healplus.dto.AuthDtos;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testes de integração para o fluxo completo de autenticação:
 * - Registro de usuário
 * - Login
 * - Acesso a rotas protegidas
 * - Refresh token
 * - Logout
 * - CORS
 * - Validações de segurança
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static String accessToken;
    private static String testEmail;
    private static String testPassword;

    @BeforeAll
    static void setup() {
        testEmail = "test_" + System.currentTimeMillis() + "@healplus.test";
        testPassword = "SecurePassword123!@#";
    }

    // ==================== Testes de Registro ====================

    @Test
    @Order(1)
    @DisplayName("Deve registrar novo usuário com sucesso")
    void shouldRegisterNewUser() throws Exception {
        AuthDtos.UserCreate request = new AuthDtos.UserCreate();
        request.setEmail(testEmail);
        request.setPassword(testPassword);
        request.setName("Test User");
        request.setRole("professional");

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.data.token").exists())
                .andExpect(jsonPath("$.data.user").exists())
                .andExpect(jsonPath("$.data.expiresIn").exists())
                .andExpect(cookie().exists("healplus_access_token"))
                .andExpect(cookie().httpOnly("healplus_access_token", true))
                .andReturn();

        // Salvar token para próximos testes
        String response = result.getResponse().getContentAsString();
        accessToken = objectMapper.readTree(response).path("data").path("token").asText();
    }

    @Test
    @Order(2)
    @DisplayName("Não deve registrar usuário com email duplicado")
    void shouldNotRegisterDuplicateEmail() throws Exception {
        AuthDtos.UserCreate request = new AuthDtos.UserCreate();
        request.setEmail(testEmail);
        request.setPassword(testPassword);
        request.setName("Another User");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("error"));
    }

    @Test
    @Order(3)
    @DisplayName("Não deve registrar usuário com email inválido")
    void shouldNotRegisterInvalidEmail() throws Exception {
        AuthDtos.UserCreate request = new AuthDtos.UserCreate();
        request.setEmail("invalid-email");
        request.setPassword(testPassword);
        request.setName("Test User");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("error"))
                .andExpect(jsonPath("$.errors").isArray());
    }

    @Test
    @Order(4)
    @DisplayName("Não deve registrar usuário com senha fraca")
    void shouldNotRegisterWeakPassword() throws Exception {
        AuthDtos.UserCreate request = new AuthDtos.UserCreate();
        request.setEmail("weak_password@healplus.test");
        request.setPassword("123");
        request.setName("Test User");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("error"));
    }

    // ==================== Testes de Login ====================

    @Test
    @Order(10)
    @DisplayName("Deve fazer login com sucesso")
    void shouldLoginSuccessfully() throws Exception {
        AuthDtos.UserLogin request = new AuthDtos.UserLogin();
        request.setEmail(testEmail);
        request.setPassword(testPassword);

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.data.token").exists())
                .andExpect(jsonPath("$.data.user.email").value(testEmail))
                .andExpect(cookie().exists("healplus_access_token"))
                .andReturn();

        String response = result.getResponse().getContentAsString();
        accessToken = objectMapper.readTree(response).path("data").path("token").asText();
    }

    @Test
    @Order(11)
    @DisplayName("Não deve fazer login com credenciais inválidas")
    void shouldNotLoginWithInvalidCredentials() throws Exception {
        AuthDtos.UserLogin request = new AuthDtos.UserLogin();
        request.setEmail(testEmail);
        request.setPassword("wrong_password");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value("error"));
    }

    @Test
    @Order(12)
    @DisplayName("Não deve fazer login com email inexistente")
    void shouldNotLoginWithNonexistentEmail() throws Exception {
        AuthDtos.UserLogin request = new AuthDtos.UserLogin();
        request.setEmail("nonexistent@healplus.test");
        request.setPassword(testPassword);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value("error"));
    }

    // ==================== Testes de Rotas Protegidas ====================

    @Test
    @Order(20)
    @DisplayName("Deve acessar rota protegida com token válido")
    void shouldAccessProtectedRouteWithValidToken() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.data.email").value(testEmail));
    }

    @Test
    @Order(21)
    @DisplayName("Não deve acessar rota protegida sem token")
    void shouldNotAccessProtectedRouteWithoutToken() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(22)
    @DisplayName("Não deve acessar rota protegida com token inválido")
    void shouldNotAccessProtectedRouteWithInvalidToken() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                .header("Authorization", "Bearer invalid_token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(23)
    @DisplayName("Não deve acessar rota protegida com token malformado")
    void shouldNotAccessProtectedRouteWithMalformedToken() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                .header("Authorization", "InvalidFormat token"))
                .andExpect(status().isUnauthorized());
    }

    // ==================== Testes de Check Auth ====================

    @Test
    @Order(30)
    @DisplayName("Deve verificar autenticação com token válido")
    void shouldCheckAuthWithValidToken() throws Exception {
        mockMvc.perform(get("/api/auth/check")
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.data.authenticated").value(true));
    }

    @Test
    @Order(31)
    @DisplayName("Deve retornar não autenticado sem token")
    void shouldReturnNotAuthenticatedWithoutToken() throws Exception {
        mockMvc.perform(get("/api/auth/check"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.data.authenticated").value(false));
    }

    // ==================== Testes de CORS ====================

    @Test
    @Order(40)
    @DisplayName("Deve permitir requisições CORS de origem permitida")
    void shouldAllowCorsFromAllowedOrigin() throws Exception {
        mockMvc.perform(options("/api/auth/login")
                .header("Origin", "http://localhost:3000")
                .header("Access-Control-Request-Method", "POST")
                .header("Access-Control-Request-Headers", "Content-Type"))
                .andExpect(status().isOk())
                .andExpect(header().exists("Access-Control-Allow-Origin"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test
    @Order(41)
    @DisplayName("Deve bloquear requisições CORS de origem não permitida")
    void shouldBlockCorsFromUnallowedOrigin() throws Exception {
        mockMvc.perform(options("/api/auth/login")
                .header("Origin", "http://malicious-site.com")
                .header("Access-Control-Request-Method", "POST"))
                .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }

    // ==================== Testes de Headers de Segurança ====================

    @Test
    @Order(50)
    @DisplayName("Deve incluir headers de segurança na resposta")
    void shouldIncludeSecurityHeaders() throws Exception {
        mockMvc.perform(get("/api/auth/check"))
                .andExpect(header().exists("X-Frame-Options"))
                .andExpect(header().exists("X-Content-Type-Options"))
                .andExpect(header().exists("X-XSS-Protection"))
                .andExpect(header().exists("Content-Security-Policy"))
                .andExpect(header().exists("Strict-Transport-Security"));
    }

    // ==================== Testes de Validação de Input ====================

    @Test
    @Order(60)
    @DisplayName("Deve rejeitar JSON malformado")
    void shouldRejectMalformedJson() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{ invalid json }"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("error"));
    }

    @Test
    @Order(61)
    @DisplayName("Deve rejeitar campos vazios obrigatórios")
    void shouldRejectEmptyRequiredFields() throws Exception {
        AuthDtos.UserLogin request = new AuthDtos.UserLogin();
        request.setEmail("");
        request.setPassword("");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("error"))
                .andExpect(jsonPath("$.errors").isArray());
    }

    @Test
    @Order(62)
    @DisplayName("Deve rejeitar campos nulos obrigatórios")
    void shouldRejectNullRequiredFields() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("error"));
    }

    // ==================== Testes de Logout ====================

    @Test
    @Order(90)
    @DisplayName("Deve fazer logout com sucesso")
    void shouldLogoutSuccessfully() throws Exception {
        // Primeiro fazer login para obter novo token
        AuthDtos.UserLogin loginRequest = new AuthDtos.UserLogin();
        loginRequest.setEmail(testEmail);
        loginRequest.setPassword(testPassword);

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String response = loginResult.getResponse().getContentAsString();
        String newToken = objectMapper.readTree(response).path("data").path("token").asText();

        // Fazer logout
        mockMvc.perform(post("/api/auth/logout")
                .header("Authorization", "Bearer " + newToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(cookie().maxAge("healplus_access_token", 0));
    }

    // ==================== Testes de Proteção contra Injection ====================

    @Test
    @Order(70)
    @DisplayName("Deve sanitizar input contra SQL Injection")
    void shouldSanitizeAgainstSqlInjection() throws Exception {
        AuthDtos.UserLogin request = new AuthDtos.UserLogin();
        request.setEmail("admin' OR '1'='1");
        request.setPassword("password");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest()); // Email inválido
    }

    @Test
    @Order(71)
    @DisplayName("Deve sanitizar input contra XSS")
    void shouldSanitizeAgainstXss() throws Exception {
        AuthDtos.UserCreate request = new AuthDtos.UserCreate();
        request.setEmail("xss@healplus.test");
        request.setPassword(testPassword);
        request.setName("<script>alert('xss')</script>");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest()); // Nome inválido
    }
}
