package com.bamdow.mapper;

import com.bamdow.pojo.dto.PageQuery;
import com.bamdow.pojo.entity.Project;
import com.bamdow.pojo.vo.ProjectDetailVO;
import com.bamdow.pojo.vo.ProjectListVO;
import com.github.pagehelper.Page;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ProjectMapper {

    /**
     * 项目分页展示
     * @param pageQuery
     * @return
     */
    Page<ProjectListVO> pageQuery(PageQuery pageQuery);

    /**
     * 插入项目主表
     * @param project 项目实体
     */
    void insert(Project project);
}