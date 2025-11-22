package com.healplus.security;

import com.healplus.entities.User;
import com.healplus.repositories.UserRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
  private final JwtUtil jwtUtil;
  private final UserRepository userRepository;

  public JwtAuthFilter(JwtUtil jwtUtil, UserRepository userRepository) {
    this.jwtUtil = jwtUtil;
    this.userRepository = userRepository;
  }

  @Override
  protected void doFilterInternal(@org.springframework.lang.NonNull HttpServletRequest request, @org.springframework.lang.NonNull HttpServletResponse response, @org.springframework.lang.NonNull FilterChain chain) throws ServletException, IOException {
    String header = request.getHeader(HttpHeaders.AUTHORIZATION);
    if (header != null && header.startsWith("Bearer ")) {
      String token = header.substring(7);
      try {
        String userId = jwtUtil.parseUserId(token);
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
          UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(userOpt.get(), null, null);
          auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
          SecurityContextHolder.getContext().setAuthentication(auth);
        }
      } catch (Exception ignored) {}
    }
    chain.doFilter(request, response);
  }
}