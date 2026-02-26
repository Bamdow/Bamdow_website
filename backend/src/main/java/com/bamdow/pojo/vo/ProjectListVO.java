package com.bamdow.pojo.vo;
import lombok.Data;
import java.util.List;

@Data
public class ProjectListVO {
    private String id;
    private String title;
    private String description;
    private String category;
    private List<String> tags;

    // 图片URL列表
    private List<String> images;

    //  bilingual title for frontend
    private BilingualTitle bilingualTitle;

    @Data
    public static class BilingualTitle {
        private String zh;
        private String en;
    }
}