package com.bamdow.pojo.entity;

import lombok.Data;

import java.sql.Timestamp;

@Data
public class MarkdownFile {
    private String id;
//    private String name;
    private String fileName;
    private String ossUrl;
    private Timestamp createdAt;
    private Timestamp updatedAt;
}
