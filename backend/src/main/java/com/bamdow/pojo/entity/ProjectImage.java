package com.bamdow.pojo.entity;

import lombok.Data;

@Data
public class ProjectImage {
    private String id;
    private String projectId;
    private String imageUrl;
    private Integer sortOrder;
}