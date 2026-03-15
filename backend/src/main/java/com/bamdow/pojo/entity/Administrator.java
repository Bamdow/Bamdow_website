package com.bamdow.pojo.entity;

import lombok.Data;

import java.sql.Timestamp;

@Data
public class Administrator {
    private String id;
    private String administratorname;
    private String password;
    private String imageUrl;
    private Timestamp createdAt;
    private Timestamp updatedAt;
}
