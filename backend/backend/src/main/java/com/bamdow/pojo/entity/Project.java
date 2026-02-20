package com.bamdow.pojo.entity;

import lombok.Data;
import java.sql.Timestamp;

@Data
public class Project {
    private String id;
    private String title;
    private String description;
    private String image;
    private String category;
    private String tags;
    private Timestamp createdAt;
    private Timestamp updatedAt;
}