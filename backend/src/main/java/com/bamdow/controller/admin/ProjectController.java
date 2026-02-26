package com.bamdow.controller.admin;

import com.bamdow.pojo.dto.PageQuery;
import com.bamdow.pojo.dto.ProjectCreateDTO;
import com.bamdow.pojo.dto.ProjectUpdateDTO;
import com.bamdow.pojo.result.PageResult;
import com.bamdow.pojo.result.Result;
import com.bamdow.pojo.vo.ProjectDetailVO;
import com.bamdow.service.ProjectService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@Slf4j
@RequestMapping("/admin/projects")
public class ProjectController {
    @Autowired
    ProjectService projectService;

    @PostMapping
    public Result save(@RequestBody ProjectCreateDTO projectCreateDTO) {
        log.info("新增作品{}", projectCreateDTO);
        projectService.save(projectCreateDTO);
        return Result.success();
    }

    @GetMapping
    public Result<PageResult> page(PageQuery pageQuery) {
        log.info("全种类作品分页查询{}", pageQuery);
        PageResult pageResult = projectService.pageQuery(pageQuery);
        return Result.success(pageResult);
    }

    @GetMapping("/{id}")
    public Result<ProjectDetailVO> detail(@PathVariable String id) {
        log.info("查询作品id为：{}",id);
        ProjectDetailVO projectDetailVO=projectService.getById(id);
        return Result.success(projectDetailVO);
    }

    @PutMapping("/{id}")
    public Result update(@PathVariable String id,@RequestBody ProjectUpdateDTO projectUpdateDTO) {
        log.info("更新作品",projectUpdateDTO);
        //设置id便于后面的查找
        projectUpdateDTO.setId(id);
        projectService.update(projectUpdateDTO);
        return Result.success();
    }


//    public Result delete(@PathVariable String id) {}
}