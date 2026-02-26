package com.bamdow.mapper;

import com.bamdow.pojo.entity.ProjectImage;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ProjectImageMapper {

    /**
     * 插入项目图片
     * @param projectImage 项目图片实体
     */
    void insert(ProjectImage projectImage);

    /**
     * 根据项目ID查询图片列表
     * @param projectId 项目ID
     * @return 图片列表
     */
    @Select("select * from project_images where project_id = #{projectId} order by sort_order asc")
    List<ProjectImage> getByProjectId(String projectId);

    /**
     * 根据项目ID删除所有图片
     * @param projectId 项目ID
     */
    void deleteByProjectId(String projectId);
}
