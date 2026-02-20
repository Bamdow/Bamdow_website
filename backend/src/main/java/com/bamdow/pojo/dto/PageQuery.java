package com.bamdow.pojo.dto;

import lombok.Data;

@Data
public class PageQuery {
    private Integer page = 1;
    private Integer size = 16;
    private String category = "All";
}