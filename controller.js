{
  "schema": {
    "BackgroundImageViewer": {
       "type": "object",
       "title":"Background image viewer settings",
        "properties": {
         "cycle":
                {
                "type":"number",
                "title": "cycle rate",
                "default":15
                },
         "size": {
                "type": "string",
                "title": "image size", 
                "enum": [ "maintain","fill"]
                },       
         "shuffle": {
                "type": "boolean",
                "title": "Shuffle", 
                "default":false                         
                }, 
         "sources":
                {
                "type": "array",
                "items":{
                  "type":"object",
                  "title": "Image Sources",
                    "properties": {
                      "name": {
                        "type": "string",
                        "title": "Name",
                        "required": true
                      },
                      "path": {
                        "type": "string",
                        "title": "path"           
                      }
                    }
                  }              
              }
        }
    }            
  },
  "form":[
    {      
      "title":"Background Image source configuration",
      "type":"fieldset",      
      "_comment":"put this content at the bottom of list of config controls",
      "expandable":true,        
      "order":100,
      "items": [
        {
          "key":"BackgroundImageViewer.cycle",
          "type":"number",
          "description":"how often to change images, in seconds"
        },   
        {
          "key":"BackgroundImageViewer.size",
          "description":"how should image size be treated, maintain means keep aspect ratio<br>fill means Resize the background image to cover the entire container"
        },
        {
          "key":"BackgroundImageViewer.shuffle",
          "description":"shuffle image list"
        },
        {
          "type":"array",
          "items":[
            {
              "type":"fieldset",          
              "items":[
                {
                "description":"Name",              
                "key":"BackgroundImageViewer.sources[].name"
                },
                {
                "key":"BackgroundImageViewer.sources[].path",
                "description":"image source path"
                }  
              ]
            }
          ]
        }
      ]
    }
  ]
}      