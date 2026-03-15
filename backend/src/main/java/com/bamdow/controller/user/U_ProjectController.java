package com.bamdow.controller.user;
import cn.dev33.satoken.annotation.SaCheckLogin;
import com.bamdow.pojo.dto.PageQuery;
import com.bamdow.pojo.result.PageResult;
import com.bamdow.pojo.result.Result;
import com.bamdow.pojo.vo.ProjectDetailVO;
import com.bamdow.service.ProjectService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@Slf4j
@RequestMapping("/user/projects")
public class U_ProjectController {
    @Autowired
    ProjectService projectService;


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

}