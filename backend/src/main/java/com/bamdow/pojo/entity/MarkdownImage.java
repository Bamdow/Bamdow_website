package com.bamdow.pojo.entity;

import lombok.Data;

import java.sql.Timestamp;

@Data
public class MarkdownImage {
    private String id;
    private String markdownId;
//    private String originalPath;
    private String ossUrl;
    private Timestamp createdAt;
}
