package com.petshop.PetVille.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(RegraNegocioException.class)
  public ResponseEntity<ErroResponse> handleRegraNegocio(RegraNegocioException ex) {
    return ResponseEntity
            .badRequest()
            .body(new ErroResponse(HttpStatus.BAD_REQUEST.value(), ex.getMessage()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErroValidacaoResponse> handleValidacao(MethodArgumentNotValidException ex) {
    Map<String, String> erros = new HashMap<>();

    ex.getBindingResult().getAllErrors().forEach(error -> {
      String campo = ((FieldError) error).getField();
      String mensagem = error.getDefaultMessage();
      erros.put(campo, mensagem);
    });

    return ResponseEntity
            .unprocessableEntity()
            .body(new ErroValidacaoResponse(
                    HttpStatus.UNPROCESSABLE_ENTITY.value(),
                    "Erro de validação nos campos enviados",
                    erros
            ));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErroResponse> handleGenerico(Exception ex) {
    return ResponseEntity
            .internalServerError()
            .body(new ErroResponse(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Ocorreu um erro interno. Tente novamente mais tarde."
            ));
  }

  public record ErroResponse(int status, String mensagem, LocalDateTime timestamp) {
    public ErroResponse(int status, String mensagem) {
      this(status, mensagem, LocalDateTime.now());
    }
  }

  public record ErroValidacaoResponse(int status, String mensagem, Map<String, String> erros, LocalDateTime timestamp) {
    public ErroValidacaoResponse(int status, String mensagem, Map<String, String> erros) {
      this(status, mensagem, erros, LocalDateTime.now());
    }
  }
}