package com.bamdow.pojo.dto;

import lombok.Data;

@Data
public class AdministratorLoginDTO {
    private String administratorname;
    private String password;
    private Boolean rememberMe;
}
