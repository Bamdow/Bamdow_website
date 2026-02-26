package com.bamdow.pojo.vo;
import lombok.Data;
import java.sql.Timestamp;
import java.util.List;

@Data
public class ProjectDetailVO {
    private String id;
    private String title;
    private String description;
    private String category;
    private List<String> tags;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    // 图片URL列表
    private List<String> images;

    // 摄影项目特有字段
    private String thoughts;
    private String additionalInfo;

    // 开发项目特有字段
    private String githubUrl;
    private String readme;
    
    // 其他项目特有字段
    private String externalLink;
    private String introduction;

    //  bilingual title for frontend
    private BilingualTitle bilingualTitle;

    @Data
    public static class BilingualTitle {
        private String zh;
        private String en;
    }
}