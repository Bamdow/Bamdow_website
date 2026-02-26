package com.bamdow.mapper;

import com.bamdow.pojo.dto.PageQuery;
import com.bamdow.pojo.entity.Project;
import com.bamdow.pojo.vo.ProjectDetailVO;
import com.bamdow.pojo.vo.ProjectListVO;
import com.bamdow.pojo.vo.ProjectQueryVO;
import com.github.pagehelper.Page;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface ProjectMapper {

    /**
     * 项目分页展示
     * @param pageQuery
     * @return
     */
    Page<ProjectQueryVO> pageQuery(PageQuery pageQuery);

    /**
     * 插入项目主表
     * @param project 项目实体
     */
    void insert(Project project);

    /**
     * 根据id查询主表作品
     * @param id
     * @return
     */
    @Select("select * from projects where id = #{id}")
    Project getById(String id);

    /**
     * 修改项目
     * @param project
     */
    void update(Project project);

    /**
     * 根据id删除项目
     * @param id
     */
    @Delete("delete from projects where id=#{id}")
    void deleteById(String id);
}