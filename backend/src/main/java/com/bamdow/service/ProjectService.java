package com.bamdow.service;

import com.bamdow.pojo.dto.PageQuery;
import com.bamdow.pojo.dto.ProjectCreateDTO;
import com.bamdow.pojo.dto.ProjectUpdateDTO;
import com.bamdow.pojo.result.PageResult;
import com.bamdow.pojo.vo.ProjectDetailVO;

import java.util.List;

public interface ProjectService {
    //新增作品
    void save(ProjectCreateDTO projectCreateDTO);

    //分页查询作品
    PageResult pageQuery(PageQuery pageQuery);

    //根据id查询作品
    ProjectDetailVO getById(String id);

    //修改作品
    void update(ProjectUpdateDTO projectUpdateDTO);

    //批量删除作品
    void deleteBatch(List<String> ids);
}