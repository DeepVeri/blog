package com.deepveir.blog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;

@SpringBootApplication
public class BlogApplication {

	public static void main(String[] args) {
		SpringApplication app = new SpringApplication(BlogApplication.class);
		app.addListeners((ApplicationListener<ApplicationReadyEvent>) event -> {
			System.out.println("================ deepveir 启动成功 =================");
			System.out.println("数据库连上了");
			System.out.println("所有 Bean 初始化完成");
			System.out.println("Web 端口绑定成功");
			System.out.println("后端已经可以正常接收请求");
			System.out.println("====================================================");
		});
		app.run(args);
	}

}
