---
title: "豆包文字转语音"
date: 2025-01-26
tags: ["豆包","兴趣"]
summary: "使用 [豆包网页版](https://www.doubao.com/chat/) 的接口实现**文字转语音**"
---
![image.png](/blog/images/32869c52e5804dcdb5f1ebd9740e27fe.image.png)

F12 查看逻辑

![image.png](/blog/images/34e3b5733e759dead56fe435bac46fa4.image.png)

通过 webservice，先发送请求，内容为需要转为语音的文字
```json
{"event":"text","text":"以下分别从给朋友、家人、同事三个角度，为你创作新春祝福：\n\n### 给朋友\n宝子，龙年新春到啦！愿你在这新的一年，像龙一样威风凛凛，活力满满！所有的倒霉事都被龙尾巴一扫而光，好事则如烟花般噼里啪啦接踵而至。愿你去想去的地方，见想见的人，做想做的事，每一天都能笑出鹅叫，快乐到飞起！新的一年，咱们继续一起疯，一起闹，一起把生活折腾得热气腾腾！ \n\n### 给家人\n亲爱的家人们，龙年钟声敲响，新春佳节已至。在这祥龙贺岁的美好时刻，愿咱们一家人如同龙行四海般，运势亨通，生活顺意。希望长辈们身体硬朗，吃嘛嘛香，尽享天伦之乐；孩子们活泼聪慧，学业如芝麻开花节节高；而我们这些中坚力量，事业腾飞，工作轻松又多金。一家人整整齐齐，和和美美，一起迎接龙年里每一个灿烂的日子，让幸福的笑声永远在咱们家中回荡。 \n\n### 给同事\n各位同事，祥龙贺岁，福满人间！值此新春佳节，愿我们在龙年里，如同蛟龙得水，在工作的海洋中畅快遨游，业绩如飞龙在天，一飞冲天。新的一年，咱们携手共进，以龙的精神，攻坚克难，让项目顺利推进，让团队蒸蒸日上。也希望大家在忙碌工作之余，能尽情享受生活的美好，阖家欢乐，幸福安康，共同开启龙年的辉煌篇章！ "}	
```
webservice 就会返回 mp3 的二进制文件，拼接在一起即完整的 mp3.

完整代码，仅供参考
```go
package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/websocket"
)

// 文字转语音
func main() {
	// WebSocket 服务的地址 (wss:// 或 ws://)
	url := "wss://ws-samantha.doubao.com/samantha/audio/tts?speaker=zh_female_taozi_conversation_v4_wvae_bigtts&format=aac&speech_rate=0&pitch=0&version_code=20800&language=zh&device_platform=web&aid=497858&real_aid=497858&pc_version=1.51.82&pkg_type=release_version&device_id=7464034169136465444&web_id=7464034176154175012&tea_uuid=7464034176154175012&use-olympus-account=1&region=CN&sys_region=CN&samantha_web=1"
	// 自定义请求头
	headers := http.Header{}
        // TODO: 放入 cookie
	headers.Add("cookie", "")

	// 创建 WebSocket 连接
	conn, _, err := websocket.DefaultDialer.Dial(url, headers)
	if err != nil {
		log.Fatalf("连接 WebSocket 失败: %v", err)
	}
	defer conn.Close()

	fmt.Println("已连接到 WebSocket")

	// 向服务端发送消息 (如果需要)
	err = conn.WriteMessage(websocket.TextMessage, []byte(`{"event":"text","text":"以下分别从给朋友、家人、同事三个角度，为你创作新春祝福：\n\n### 给朋友\n宝子，龙年新春到啦！愿你在这新的一年，像龙一样威风凛凛，活力满满！所有的倒霉事都被龙尾巴一扫而光，好事则如烟花般噼里啪啦接踵而至。愿你去想去的地方，见想见的人，做想做的事，每一天都能笑出鹅叫，快乐到飞起！新的一年，咱们继续一起疯，一起闹，一起把生活折腾得热气腾腾！ \n\n### 给家人\n亲爱的家人们，龙年钟声敲响，新春佳节已至。在这祥龙贺岁的美好时刻，愿咱们一家人如同龙行四海般，运势亨通，生活顺意。希望长辈们身体硬朗，吃嘛嘛香，尽享天伦之乐；孩子们活泼聪慧，学业如芝麻开花节节高；而我们这些中坚力量，事业腾飞，工作轻松又多金。一家人整整齐齐，和和美美，一起迎接龙年里每一个灿烂的日子，让幸福的笑声永远在咱们家中回荡。 \n\n### 给同事\n各位同事，祥龙贺岁，福满人间！值此新春佳节，愿我们在龙年里，如同蛟龙得水，在工作的海洋中畅快遨游，业绩如飞龙在天，一飞冲天。新的一年，咱们携手共进，以龙的精神，攻坚克难，让项目顺利推进，让团队蒸蒸日上。也希望大家在忙碌工作之余，能尽情享受生活的美好，阖家欢乐，幸福安康，共同开启龙年的辉煌篇章！ "}	`))
	if err != nil {
		log.Fatalf("发送消息失败: %v", err)
	}

	// 创建文件用于保存接收到的数据
	os.Remove("output.mp3")
	file, err := os.Create("output.mp3")
	if err != nil {
		log.Fatalf("创建文件失败: %v", err)
	}
	file.Close()
	file, err = os.OpenFile("output.mp3", os.O_APPEND|os.O_WRONLY, 0644) // 替换为目标文件名
	if err != nil {
		log.Fatalf("创建文件失败: %v", err)
	}
	defer file.Close()

	// 接收消息
outer:
	for {
		messageType, message, err := conn.ReadMessage()
		if err != nil {
			log.Fatalf("读取消息失败: %v", err)
		}

		// 根据消息类型处理
		switch messageType {
		case websocket.TextMessage:
			fmt.Printf("收到文本消息: %s\n", string(message))
			if string(message) == `{"event":"sentence_end","code":0,"message":""}` {
				break outer
			}
		case websocket.BinaryMessage:
			fmt.Printf("收到二进制消息: %x\n", message)
			_, err = file.Write(message)
			if err != nil {
				log.Fatalf("写入文件失败: %v", err)
			}

		default:
			fmt.Println("收到未知消息类型")
		}
	}
}
```
